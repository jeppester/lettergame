import ViewList from '../../engine/ViewList.js'
import ImageView from '../../engine/ImageView.js'
import spliceRandom from '../utils/spliceRandom.js'
import { easeInCubic, easeInOutCubic, easeOutCubic } from '../engine/Tweens.js'
import playAudio from '../utils/playAudio.js'

export default class Trophy extends ViewList {
  constructor(gameContext, letterCount) {
    super()

    const { assetLoader, animator } = gameContext

    this.letterCount = letterCount
    const lettersPerAward = letterCount / 5

    this.awardLetterCounts = []
    for (let i = 1; i <= 5; i++) {
      this.awardLetterCounts.push(Math.round(i * lettersPerAward))
    }
    this.progress = 0

    this.resize(gameContext)
    Object.assign(this, this.getMinifiedProps(gameContext))

    window.trophy = this
    window.gameContext = gameContext

    const silhouette = assetLoader.images[`trophy-silhouette`]
    const cacheCanvas = document.createElement('canvas')
    cacheCanvas.width = this.size * gameContext.scale
    cacheCanvas.height = Math.ceil(silhouette.height / silhouette.width * cacheCanvas.width)
    const cacheCanvasContext = cacheCanvas.getContext('2d')
    cacheCanvasContext.drawImage(silhouette, 0, 0, cacheCanvas.width, cacheCanvas.height)

    this.cacheCanvas = cacheCanvas
    this.cacheCanvasContext = cacheCanvasContext

    this.background = new ImageView(this.cacheCanvas, { width: this.size })
    this.background.originXFraction = .5
    this.background.originYFraction = .5

    this.pieces = [...new Array(5)].map((_value, index) => {
      const pieceImage = assetLoader.images[`trophy${index + 1}`]
      const view = new ImageView(pieceImage, { width: this.size })
      view.originXFraction = .5
      view.originYFraction = .5
      view.opacity = 0

      return view
    })

    this.push(this.background)

    this.inactivePieces = this.pieces.slice()
    this.activePieces = []

    animator
      .animate(this.background)
      .tween({
        opacity: { from: 0, to: 1},
        [this.isLandscape ? 'originY' : 'originX']: { from: -this.size * .5 },
      }, 500, easeOutCubic)
      .start()
  }

  getWillAwardPieceNext() {
    return this.awardLetterCounts.includes(this.progress + 1)
  }

  async advance(gameContext) {
    this.progress ++

    const finished = this.progress === this.letterCount
    if (this.awardLetterCounts.includes(this.progress)) {
      await this.animateIn(gameContext)
      await this.awardPiece(gameContext)

      if (!finished) {
        await this.animateOut(gameContext)
      }
    }

    return finished
  }

  async celebrate(gameContext) {
    const { animator } = gameContext

    const shouldRotate = !navigator.userAgent.includes('Firefox')

    const distX = this.size * .06
    const distY = this.size * .04
    let wiggleInT = 0

    await Promise.all([
      animator
        .animate(this)
        .tween(t => {
          wiggleInT = Math.max(t, wiggleInT)

          const rotationX = t * Math.PI * 2
          const rotationY = Math.PI / 4 + t * Math.PI * 4
          const rotation = Math.sin(t * Math.PI * 2) * 10

          return {
            originX: Math.cos(rotationX) * distX * wiggleInT,
            originY: Math.sin(rotationY) * distY * wiggleInT,
            rotation: shouldRotate ? rotation * wiggleInT : 0,
          }
        }, 4000)
        .loop()
    ])
  }

  async awardPiece(gameContext) {
    const { animator, audioContext, assetLoader } = gameContext

    const newPiece = spliceRandom(this.inactivePieces)
    this.activePieces.push(newPiece)
    this.push(newPiece)
    const angle = this.getPieceAngle(this.pieces.indexOf(newPiece))
    const distance = this.size * .3
    const bounceDist = this.size * .02
    const duration = 200

    await Promise.all([
      animator
        .animate(newPiece)
        .tween({
          x: { from: Math.cos(angle) * distance, to: 0 },
          y: { from: Math.sin(angle) * distance, to: 0 },
          opacity: { from: 0, to: 1 },
        }, duration, easeInCubic)
        .start(),
      animator
        .wait(duration - 100) // The impact sound has a short amount of silence before it starts
        .then(() => {
          // On purpose we don't return the result of the playAudio call.
          // We don't want the impact animation to wait until after the sfx has finished
          playAudio(audioContext, assetLoader.pick('audio', 'trophy/cling'))
        }),
    ])

    await animator
      .animate(this)
      .tween({ originX: Math.cos(angle) * bounceDist, originY: Math.sin(angle) * bounceDist }, 120, easeOutCubic)
      .tween({ originX: 0, originY: 0 }, 120, easeInCubic)
      .wait(500)
      .start()

    this.cacheCanvasContext.drawImage(newPiece.image, 0, 0, this.cacheCanvas.width, this.cacheCanvas.height)
    this.removeChild(newPiece)
  }

  getPieceAngle(index) {
    const angleIncrement = Math.PI * 2 / this.pieces.length
    const angleOffset = Math.PI * 0.5

    return angleOffset + angleIncrement * index
  }

  getMinifiedProps(gameContext) {
    if (this.isLandscape) {
      return {
        x: 0,
        y: gameContext.height / 2 - this.minifiedSize * 0.6 - 10,
        scaleX: this.minifiedScale,
        scaleY: this.minifiedScale,
      }
    }
    else {
      return {
        x: gameContext.width / 2 - this.minifiedSize * 0.6 - 10,
        y: 0,
        scaleX: this.minifiedScale,
        scaleY: this.minifiedScale,
      }
    }
  }

  async animateIn(gameContext) {
    const { animator } = gameContext

    const duration = 600

    await animator
      .animate(this)
      .tween({
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0,
      }, duration, easeInOutCubic)
      .start(),
    await animator.wait(600)
  }

  async animateOut(gameContext) {
    const { animator } = gameContext

    const duration = 600

    await animator
    .animate(this)
    .tween(this.getMinifiedProps(gameContext), duration, easeInOutCubic)
    .start(),

    await animator.wait(200)
  }

  handleEvent({ gameContext, event }) {
    if (event.type == "resize") {
      this.resize(gameContext)
    }
    super.handleEvent({ gameContext, event })
  }

  resize({ width, height }) {
    this.size = Math.min(width, height) * .5
    this.isLandscape = width > height
    this.minifiedScale = .05
    this.minifiedSize = this.size * this.minifiedScale
  }
}
