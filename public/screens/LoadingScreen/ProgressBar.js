import { easeOutCubic } from '../../engine/Tweens.js'
import View from '../../engine/View.js'

export default class ProgressBar extends View {
  constructor(onFinished) {
    super()

    this.onFinished = onFinished
    this.percentage = 0
    this.animatedPercentage = 0
    this.spacingPercentage = 40
  }

  updateProgress(gameContext, percentage) {
    const { animator } = gameContext
    this.percentage = percentage

    animator.cancelTarget(this)

    animator
      .animate(this)
      .tween({ animatedPercentage: { to: percentage } }, 200, easeOutCubic)
      .start(this.onAnimationDone.bind(this))
  }

  onAnimationDone() {
    if (this.animatedPercentage === 100) {
      this.onFinished()
    }
  }

  draw(gameContext) {
    super.draw(gameContext, () => {
      const { width, height } = gameContext
      const spacingPx = width / 100 * this.spacingPercentage

      const barWidth = width - 2 * spacingPx
      const barHeight = 5

      const { ctx } = gameContext
      ctx.strokeStyle = "#aaa"
      ctx.fillStyle = "#000"
      const initialAlpha = ctx.globalAlpha

      ctx.beginPath();
      ctx.roundRect(spacingPx, (height - barHeight) / 2, barWidth, barHeight, 10);
      ctx.globalAlpha = 0.2 * initialAlpha
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(spacingPx, (height - barHeight) / 2, barWidth / 100 * this.animatedPercentage, barHeight, 2);
      ctx.globalAlpha = 1 * initialAlpha
      ctx.fill();
    })
  }
}
