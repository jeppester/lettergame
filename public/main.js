import ViewList from './engine/ViewList.js'
import LoadingScreen from './screens/LoadingScreen/LoadingScreen.js'
import Animator from './engine/Animator.js'
import AssetLoader from './engine/AssetLoader.js'

let lastTime = performance.now()

const mainViewList = new ViewList()
const canvas = document.querySelector('#game')
const ctx = canvas.getContext('2d')
const audioContext = new AudioContext()

const gameContext = {
  dT: 0,
  width: 0,
  height: 0,
  scale: 1,
  mainViewList,
  ctx,
  audioContext,
  animator: new Animator(lastTime),
  assetLoader: new AssetLoader(audioContext),
}

const resize = () => {
  let scale = window.devicePixelRatio

  if (navigator.userAgent.includes('Firefox')) {
    scale = 1 // Large canvases are really slow in firefox
  }

  gameContext.width = window.innerWidth
  gameContext.height = window.innerHeight
  gameContext.scale = scale

  canvas.width = Math.floor(gameContext.width * scale)
  canvas.height = Math.floor(gameContext.height * scale)
}
window.addEventListener('resize', resize)
resize()

const mainLoop = (currentTime) => {
  gameContext.dT = currentTime - lastTime
  lastTime = currentTime

  if (gameContext.dT < 500) { // Don't update anything if dT is too large (because of lost focus)
    mainViewList.update(gameContext)
    gameContext.animator.update(gameContext)
  }


  ctx.resetTransform()
  gameContext.ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.scale(gameContext.scale, gameContext.scale)
  mainViewList.draw(gameContext)

  requestAnimationFrame(mainLoop)
}

const handleEvent = (event) => {
  mainViewList.handleEvent({ gameContext, event })
}

;['pointerdown', 'pointerup', 'pointermove', 'pointerout', 'pointercancel'].forEach(name => {
  canvas.addEventListener(name, handleEvent)
})
;['resize'].forEach(name => {
  addEventListener(name, handleEvent)
})

requestAnimationFrame(mainLoop)

mainViewList.push(new LoadingScreen(gameContext))
