import ViewList from './ViewList.js'
import LoaderRoom from './LoaderRoom.js'
import Animator from './Animator.js'
import AssetLoader from './AssetLoader.js'

let lastTime = performance.now()

const mainViewList = new ViewList()
const canvas = document.querySelector('#game')
const audioContext = new AudioContext()

const gameContext = {
  dT: 0,
  width: 0,
  height: 0,
  mainViewList,
  ctx: canvas.getContext('2d'),
  audioContext,
  animator: new Animator(lastTime),
  assetLoader: new AssetLoader(audioContext),
}

const resize = () => {
  canvas.width = gameContext.width = window.innerWidth;
  canvas.height = gameContext.height = window.innerHeight
}
window.addEventListener('resize', resize)
resize()

const mainLoop = (currentTime) => {
  gameContext.dT = currentTime - lastTime
  lastTime = currentTime

  mainViewList.update(gameContext)
  gameContext.animator.update(gameContext)

  gameContext.ctx.clearRect(0, 0, gameContext.width, gameContext.height)

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

mainViewList.push(new LoaderRoom(gameContext))
