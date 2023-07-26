import Clickable from '../../engine/Clickable.js'
import theme from '../../consts/theme.js'
import { easeInOutSine } from '../engine/Tweens.js'

export default class LetterButton extends Clickable {
  constructor({ letter, onClick, position }) {
    super()

    this.rotation = 0
    this.size = 0
    this.letter = letter
    this.onClick = onClick
    this.boxScale = 1
    this.state = "normal"
    this.position = position
  }

  setFont(ctx) {
    ctx.textAlign = 'center'
    ctx.font = `${this.size * .9}px Arial`;
  }

  updateTextOffset({ ctx }) {
    ctx.save()
    this.setFont(ctx)
    const textMeasure = ctx.measureText(this.letter);
    this.textYOffset = (textMeasure.actualBoundingBoxAscent - textMeasure.actualBoundingBoxDescent) / 2
    ctx.restore()
  }

  setBoundingBoxPath(_gameContext, boundingBox) {
    const style = this.getStyle()

    boundingBox.roundRect(-this.size / 2, -this.size / 2, this.size, this.size, style.borderRadius);
  }

  getStyle() {
    return {
      ...theme.button,
      ...theme[`button--${this.state}`],
      ...(this.isDown && theme[`button--${this.state}--down`]),
    }
  }

  draw(gameContext) {
    super.draw(gameContext, () => {
      const { ctx } = gameContext
      ctx.beginPath();
      ctx.roundRect(
        -this.size / 2 * this.boxScale,
        -this.size / 2 * this.boxScale,
        this.size * this.boxScale,
        this.size * this.boxScale,
        theme.button.borderRadius
      );

      const style = this.getStyle()

      ctx.fillStyle = style.backgroundColor
      ctx.lineWidth = style.borderWidth;
      ctx.fill()

      ctx.strokeStyle = style.borderColor
      ctx.stroke();

      ctx.fillStyle = style.textColor
      this.setFont(ctx)
      ctx.fillText(this.letter, 0, this.textYOffset)
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

  handleClick() {
    this.onClick(this)
  }
}
