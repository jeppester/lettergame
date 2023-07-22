export default class ViewList {
  constructor() {
    this.children = []

    this.x = 0
    this.y = 0
    this.rotation = 0
    this.originX = 0
    this.originY = 0
    this.scaleX = 1
    this.scaleY = 1
  }

  get length() {
    return this.children.length
  }

  push(...args) {
    return this.children.push(...args)
  }

  forEach(...args) {
    return this.children.forEach(...args)
  }

  map(...args) {
    return this.children.map(...args)
  }

  filter(...args) {
    return this.children.filter(...args)
  }

  empty() {
    this.children = []
  }

  removeChild(child) {
    this.children = this.children.filter(other => other !== child)
  }

  moveToFront(child) {
    this.removeChild(child)
    this.push(child)
  }

  handleEvent(event) {
    this.forEach((object) => {
      object.handleEvent?.call(object, event)
    })
  }

  update(gameContext) {
    this.forEach((child) => {
      child.update?.call(child, gameContext)
    })
  }

  draw(gameContext) {
    const { ctx } = gameContext
    ctx.save()

    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation / 180 * Math.PI)
    ctx.scale(this.scaleX, this.scaleY);
    ctx.translate(-this.originX, -this.originY)

    this.forEach((child) => {
      child.draw?.call(child, gameContext)
    })

    ctx.restore()
  }
}
