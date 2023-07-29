import ViewList from '../../engine/ViewList.js'
import RandomModeScreen from '../RandomModeScreen/RandomModeScreen.js'
import AlphabeticalModeScreen from '../AlphabeticalModeScreen/AlphabeticalModeScreen.js'
import StartButton from './StartButton.js'
import { easeOutCubic } from '../../engine/Tweens.js'

export default class ModeSelectionScreen extends ViewList {
  constructor(gameContext) {
    super()

    const { animator } = gameContext
    this.removeChild(this.progressBar)

    this.modeButtons = [
      [AlphabeticalModeScreen, "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ", 'ABCD'],
      [RandomModeScreen,       "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ", 'AÅØB'],
      [AlphabeticalModeScreen, "abcdefghijklmnopqrstuvwxyzæøå", 'abcd'],
      [RandomModeScreen,       "abcdefghijklmnopqrstuvwxyzæøå", 'aåøb'],
    ].map(([GameModeClass, availableLettersString, buttonText]) => {
      const getGameMode = () => new GameModeClass(gameContext, availableLettersString)
      const startCallback = () => this.handleStartGame(gameContext, getGameMode)
      return new StartButton(startCallback, buttonText)
    })
    this.push(...this.modeButtons)

    this.resize(gameContext)

    this.modeButtons.forEach((button, index) => {
      button.opacity = 0
      animator
        .animate(button)
        .wait(index * 100)
        .tween({ opacity: 1, originY: { from: -button.size * .1 }}, 300, easeOutCubic)
        .start()
    })
  }

  handleStartGame(gameContext, getGameMode, selectedButton) {
    this.modeButtons.forEach(button => button.disabled = true)
    const { animator } = gameContext

    const animations = this.modeButtons.map((button) => {
      const selectedMode = button === selectedButton

      return animator
        .animate(button)
        .tween({ scaleX: selectedMode ? 1.5 : 1, scaleY: selectedMode ? 1.5 : 1, opacity: 0 }, 400, easeOutCubic)
        .wait(500)
        .start()
    })

    Promise.all(animations).then(() => {
      gameContext.mainViewList.removeChild(this)
      gameContext.mainViewList.push(getGameMode())
    })
  }

  handleEvent({ gameContext, event }) {
    if (event.type == "resize") {
      this.resize(gameContext)
    }
    super.handleEvent({ gameContext, event })
  }

  resize({ width, height }) {
    const buttonSize = Math.min(200, Math.max(width * .3, 150))
    const buttonSpacing = 30

    const cols = 2

    this.modeButtons.forEach((button, index) => {
      const col = index % cols
      const row = (index - col) / cols

      button.size = buttonSize
      button.y = height / 2 + row * (buttonSize + buttonSpacing) - (buttonSize + buttonSpacing) / 2
      button.x = width / 2 + col * (buttonSize + buttonSpacing) - (buttonSize + buttonSpacing) / 2
    })
  }
}
