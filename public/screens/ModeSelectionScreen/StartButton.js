import Clickable from '../../engine/Clickable.js'
import theme from '../../consts/theme.js'
import { easeInOutSine } from '../../engine/Tweens.js'
import playAudio from '../../utils/playAudio.js'

export default class StartButton extends Clickable {
  constructor(onClick, letters) {
    super()

    this.onClick = onClick
    this.size = 0
    this.letters = [...letters]
  }

  setBoundingBoxPath(gameContext, boundingBox) {
    this.setOutline({ ...gameContext, ctx: boundingBox })
  }

  setOutline(gameContext) {
    const { ctx } = gameContext

    ctx.roundRect(-this.size / 2, -this.size / 2, this.size, this.size, 30);
  }

  getStyle() {
    return {
      ...theme.button,
      ...(this.isDown && theme[`button--normal--down`]),
    }
  }

  draw(gameContext) {
    super.draw(gameContext, () => {
      const { ctx } = gameContext
      ctx.beginPath()
      this.setOutline(gameContext)

      const style = this.getStyle()

      ctx.fillStyle = style.backgroundColor
      ctx.lineWidth = style.borderWidth;
      ctx.fill()

      ctx.strokeStyle = style.borderColor
      ctx.stroke();

      ctx.textAlign = 'center'
      ctx.textBaseline = "middle"
      ctx.fillStyle = style.textColor
      ;[
        [-.20,-.15, .45],
        [.20,-.15, .38],
        [-.20,.23, .31],
        [.20,.23, .24],
      ].forEach(([offsetX, offsetY, sizeMultiplier], index) => {
        ctx.font = `${this.size * sizeMultiplier}px Arial`;
        ctx.fillText(this.letters[index], offsetX * this.size, offsetY * this.size)
      })
    })
  }

  handleDownStateChange(gameContext) {
    const { animator } = gameContext
    animator.animate(this)
            .tween(
              { originY: { to: this.isDown ? -this.size * 0.02 : 0 } },
              50,
              easeInOutSine
            )
            .start()
  }

  handleClick(gameContext) {
    playAudio(gameContext.audioContext, gameContext.assetLoader.pick('audio', 'button/bop'))
    this.onClick(this)
  }
}
