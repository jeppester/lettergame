import ViewList from '../../engine/ViewList.js'
import LetterButton from '../../shared/LetterButton.js'
import Trophy from '../../shared/Trophy.js'
import LetterList from './LetterList.js'
import spliceRandom from '../../utils/spliceRandom.js'
import playAudio from '../../utils/playAudio.js'
import theme from '../../consts/theme.js'
import ModeSelectionScreen from '../ModeSelectionScreen/ModeSelectionScreen.js'

export default class AlphabeticalModeScreen extends ViewList {
  constructor(gameContext) {
    super()
    this.startGame(gameContext)
  }

  startGame(gameContext) {
    this.empty()

    this.padding = 20
    this.letterButtons = new ViewList()
    this.availableLetters = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ"] // .slice(0,5)
    this.allLetters = this.availableLetters.slice()

    this.letterList = new LetterList()
    this.trophy = new Trophy(gameContext, this.allLetters.length)

    const initialLetters = this.pickButtonLetters()
    for (let i = 0; i < 3; i ++) {
      let letter = initialLetters[i]
      let position = i
      let onClick = this.handleLetterClick.bind(this, gameContext)
      this.letterButtons.push(new LetterButton({ letter, onClick, position }))
    }

    this.push(this.letterButtons, this.letterList, this.trophy)
    this.resize(gameContext)

    const { animator } = gameContext
    const delays = [0, 200, 100]
    this.letterButtons.map((button, i) => {
      button.scaleX = 0
      button.disabled = true

      animator.animate(button)
        .wait(delays[i])
        .tween({ scaleX: { to: 1 }}, 300, animator.easeOutCubic)
        .start(() => {
          if (i === 0) this.loopCorrectLetterSound(gameContext)
          button.disabled = false
        })
    })
  }

  handleEvent({ gameContext, event }) {
    if (event.type == "resize") {
      this.resize(gameContext)
    }
    super.handleEvent({ gameContext, event })
  }

  handleLetterClick(gameContext, button) {
    this.cancelLetterPlaybackTimer(gameContext)

    if (button.letter === this.availableLetters[0]) {
      this.handleCorrectLetter(gameContext, button)
    }
    else {
      this.handleIncorrectLetter(gameContext, button)
    }
  }

  async handleCorrectLetter(gameContext, button) {
    const { animator, assetLoader, audioContext, width, height } = gameContext
    const emphasizeScale = 2

    this.letterButtons.forEach((button) => button.disabled = true)
    this.letterButtons.moveToFront(button)
    this.letterList.add(gameContext, button.letter)

    const boxScale = Math.max(width, height) / (emphasizeScale * (button.size - theme.button.borderWidth))
    button.state = "enhanced"

    const otherButtons = this.letterButtons.filter(otherButton => otherButton !== button)

    await Promise.all([
      playAudio(audioContext, assetLoader.pick('audio', 'success')),
      ...otherButtons.map(otherButton => animator
        .animate(otherButton)
        .tween({ scaleX: 0 }, 400, animator.easeInOutCubic)
        .start()
      ),
      animator.animate(button)
        .tween({
          x: 0,
          y: 0,
          scaleX: emphasizeScale,
          scaleY: emphasizeScale,
          rotation: { from: -360, to: 0 },
          boxScale
        }, 400, animator.easeInOutCubic)
        .start()
    ])

    await animator
      .animate(button)
      .wait(200)
      .tween({ opacity: 0, scaleX: 6, scaleY: 6 }, 300, animator.easeOutCubic)
      .wait(200)
      .start()

    await this.trophy.advance(gameContext)

    this.resize(gameContext)
    this.availableLetters.shift()
    if (this.availableLetters.length > 0) {
      const nextLetters = this.pickButtonLetters()
      const delays = [0, 200, 100]

      this.letterButtons.map((button, i) => {
        button.letter = nextLetters[i]
        button.updateTextOffset(gameContext)
        button.scaleX = 0
        button.scaleY = 1
        button.opacity = 1
        button.boxScale = 1
        button.disabled = true
        button.state = "normal"
        animator.animate(button)
          .wait(delays[i])
          .tween({ scaleX: { to: 1 }}, 300, animator.easeOutCubic)
          .start(() => {
            if (i === 0) this.loopCorrectLetterSound(gameContext)
            button.disabled = false
          })
      })
    }
    else {
      this.trophy.celebrate(gameContext, () => this.endGame(gameContext))
    }
  }

  async handleIncorrectLetter(gameContext, button) {
    const { audioContext, animator, assetLoader, width } = gameContext

    this.letterButtons.forEach((otherButton) => {
      otherButton.disabled = true
      if (otherButton !== button) {
        otherButton.state = "muted"
      }
    })
    this.letterButtons.moveToFront(button)
    button.state = "incorrect"

    await Promise.all([
      animator
        .animate(this)
        .tween({ originX: width * .005, originY: width * .005 }, 50)
        .tween({ originX: -width * .005, originY: -width * .005 }, 50)
        .tween({ originX: 0, originY: 0 }, 50)
        .start(),
      animator
        .animate(button)
        .tween({ scaleX: 1.5, scaleY: 1.5 }, 500, animator.easeInOutCubic)
        .start(),
      playAudio(audioContext, assetLoader.pick('audio', 'failure/before-incorrect'))
        .then(() => animator.delay(300))
        .then(() => Promise.all([
          playAudio(audioContext, assetLoader.pick('audio', `letters/${button.letter}`)),
          animator
            .animate(button)
            .wait(200)
            .tween({ originX: width * .005, originY: width * .005 }, 50)
            .tween({ originX: -width * .005, originY: -width * .005 }, 50)
            .tween({ originX: 0, originY: 0 }, 50)
            .start(),
        ]))
        .then(() => animator.delay(300))
        .then(() => playAudio(audioContext, assetLoader.pick('audio', 'failure/before-correct')))
    ])

    button.state = "normal"

    await Promise.all([
      this.playCurrentLetter(gameContext),
      animator
        .animate(button)
        .tween({ scaleX: 1, scaleY: 1 }, 500, animator.easeInOutCubic)
        .start(),
    ])
    this.letterButtons.map((button) => {
      button.disabled = false
      button.state = "normal"
    })
  }

  pickButtonLetters() {
    const pool = [this.availableLetters[0]]
    while (pool.length < 3) {
      const randomLetter = this.allLetters[Math.floor(Math.random() * this.allLetters.length)]
      if (pool.includes(randomLetter)) continue

      pool.push(randomLetter)
    }

    const shuffled = []
    while(pool.length) {
      shuffled.push(spliceRandom(pool))
    }

    return shuffled
  }

  loopCorrectLetterSound(gameContext) {
    this.letterPlaybackTimer = gameContext.animator.delay(300).then(() => {
      this.playCurrentLetter(gameContext)
    })
  }

  playCurrentLetter(gameContext) {
    const { audioContext, animator, assetLoader } = gameContext

    this.cancelLetterPlaybackTimer(gameContext)
    this.letterPlaybackTimer = animator.delay(10000, 'current-letter-payback').then(() => {
      this.playCurrentLetter(gameContext)
    })

    return playAudio(audioContext, assetLoader.pick('audio', `letters/${this.availableLetters[0]}`))
  }

  cancelLetterPlaybackTimer({ animator }) {
    animator.cancelKey('current-letter-payback')
  }

  async endGame(gameContext) {
    const { animator, width, height } = gameContext
    const isLandscape = width > height

    await animator
      .animate(this)
      .tween({ [isLandscape ? 'scaleX' : 'scaleY']: 0 }, 400, animator.easeInCubic)
      .wait(200)
      .start()

    gameContext.mainViewList.removeChild(this)
    gameContext.mainViewList.push(new ModeSelectionScreen(gameContext))
  }

  resize(gameContext) {
    this.x = gameContext.width / 2
    this.y = gameContext.height / 2

    const isLandScape = gameContext.width > gameContext.height
    const maxTotalSize = 600
    this.letterList.resize(gameContext)

    if (isLandScape) {
      const maxSpace = Math.min(gameContext.width, maxTotalSize)
      const availableSpace = maxSpace - this.padding

      const positions = [-availableSpace / 3, 0, availableSpace / 3]
      const nextSize = availableSpace / 3 - this.padding

      this.letterButtons.forEach((button) => {
        button.y = 0
        button.x = positions[button.position]
        button.size = nextSize
        button.updateTextOffset(gameContext)
      })
    }
    else {
      const maxSpace = Math.min(gameContext.height, maxTotalSize)
      const availableSpace = maxSpace - this.padding

      const positions = [-availableSpace / 3, 0, availableSpace / 3]
      const nextSize = availableSpace / 3 - this.padding

      this.letterButtons.forEach((button) => {
        button.x = 0
        button.y = positions[button.position]
        button.size = nextSize
        button.updateTextOffset(gameContext)
      })
    }
  }
}
