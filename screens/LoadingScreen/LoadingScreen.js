import ViewList from '../../engine/ViewList.js'
import GameScreen from '../GameScreen/GameScreen.js'
import LoadBar from './LoadBar.js'
import StartButton from './StartButton.js'

export default class LoadingScreen extends ViewList {
  constructor(gameContext) {
    super()

    this.loadAssets(gameContext)
    this.loadBar = new LoadBar(this.onLoadBarFinished.bind(this, gameContext))
    this.push(this.loadBar)
  }

  async loadAssets(gameContext) {
    const { assetLoader } = gameContext

    await assetLoader.loadAssets({
      audio: {
        'letters.A': "/audio/letters/A.mp3",
        'letters.B': "/audio/letters/B.mp3",
        'letters.C': "/audio/letters/C.mp3",
        'letters.D': "/audio/letters/D.mp3",
        'letters.E': "/audio/letters/E.mp3",
        'letters.F': "/audio/letters/F.mp3",
        'letters.G': "/audio/letters/G.mp3",
        'letters.H': "/audio/letters/H.mp3",
        'letters.I': "/audio/letters/I.mp3",
        'letters.J': "/audio/letters/J.mp3",
        'letters.K': "/audio/letters/K.mp3",
        'letters.L': "/audio/letters/L.mp3",
        'letters.M': "/audio/letters/M.mp3",
        'letters.N': "/audio/letters/N.mp3",
        'letters.O': "/audio/letters/O.mp3",
        'letters.P': "/audio/letters/P.mp3",
        'letters.Q': "/audio/letters/Q.mp3",
        'letters.R': "/audio/letters/R.mp3",
        'letters.S': "/audio/letters/S.mp3",
        'letters.T': "/audio/letters/T.mp3",
        'letters.U': "/audio/letters/U.mp3",
        'letters.V': "/audio/letters/V.mp3",
        'letters.W': "/audio/letters/W.mp3",
        'letters.X': "/audio/letters/X.mp3",
        'letters.Y': "/audio/letters/Y.mp3",
        'letters.Z': "/audio/letters/Z.mp3",
        'letters.Æ': "/audio/letters/Æ.mp3",
        'letters.Ø': "/audio/letters/Ø.mp3",
        'letters.Å': "/audio/letters/Å.mp3",
        'success.det-har-du-styr-på': "/audio/success/det-har-du-styr-på.mp3",
        'success.du-er-en-stjerne': "/audio/success/du-er-en-stjerne.mp3",
        'success.fan-tastisk': "/audio/success/fan-tastisk.mp3",
        'success.fedest': "/audio/success/fedest.mp3",
        'success.fedt-manner': "/audio/success/fedt-manner.mp3",
        'success.fremragende': "/audio/success/fremragende.mp3",
        'success.fænomenalt': "/audio/success/fænomenalt.mp3",
        'success.godt-gættet': "/audio/success/godt-gættet.mp3",
        'success.godt-klaret': "/audio/success/godt-klaret.mp3",
        'success.hammergodt': "/audio/success/hammergodt.mp3",
        'success.henrivende': "/audio/success/henrivende.mp3",
        'success.huh-ra': "/audio/success/huh-ra.mp3",
        'success.hurra': "/audio/success/hurra.mp3",
        'success.mega-fedt': "/audio/success/mega-fedt.mp3",
        'success.sádan': "/audio/success/sádan.mp3",
        'success.sejt-manner': "/audio/success/sejt-manner.mp3",
        'success.succes': "/audio/success/succes.mp3",
        'success.utroligt': "/audio/success/utroligt.mp3",
        'success.vildt-nok': "/audio/success/vildt-nok.mp3",
        'success.vildt-sejt': "/audio/success/vildt-sejt.mp3",
      }
    }, this.onProgress.bind(this, gameContext))
  }

  onProgress(gameContext, loaded, total) {
    this.loadBar.updateProgress(gameContext, loaded / total * 100)
  }

  onLoadBarFinished(gameContext) {
    const { animator } = gameContext

    animator.animate(this.loadBar)
            .wait(400)
            .tween({ opacity: { to: 0 } }, 500)
            .wait(400)
            .start(this.handleLoaded.bind(this, gameContext))
  }

  handleLoaded(gameContext) {
    const { animator } = gameContext
    this.removeChild(this.loadBar)

    this.startButton = new StartButton(gameContext, this.handleStartGame.bind(this, gameContext))
    this.push(this.startButton)

    animator
      .animate(this.startButton)
      .tween({ opacity: { from: 0, to: 1 }, originY: { from: -this.startButton.size * .1 }}, 300, animator.easeOutCubic)
      .start()
  }

  handleStartGame(gameContext) {
    const { animator } = gameContext
    animator
      .animate(this.startButton)
      .tween({ scaleX: { to: 1.5 }, scaleY: { to: 1.5 }, opacity: { to: 0 }}, 400, animator.easeOutCubic)
      .wait(500)
      .start(() => {
        gameContext.mainViewList.removeChild(this)
        gameContext.mainViewList.push(new GameScreen(gameContext))
      })
  }
}