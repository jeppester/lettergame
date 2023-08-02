export default class View {
  constructor() {
    this.x = 0
    this.y = 0
    this.rotation = 0
    this.opacity = 1
    this.originX = 0
    this.originY = 0
    this.scaleX = 1
    this.scaleY = 1
    this.currentTransform = null
  }

  draw(gameContext, drawWithTransform) {
    const { ctx } = gameContext
    ctx.save()

    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation / 180 * Math.PI)
    ctx.scale(this.scaleX, this.scaleY);
    ctx.globalAlpha = this.opacity
    ctx.translate(-this.originX, -this.originY)

    this.currentTransform = ctx.getTransform();

    if (drawWithTransform) {
      drawWithTransform()
    }

    ctx.restore()
  }
}
