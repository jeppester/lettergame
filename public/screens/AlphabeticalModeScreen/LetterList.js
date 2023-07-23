import ViewList from '../../engine/ViewList.js'
import LetterListItem from '../../shared/LetterListItem.js'

export default class LetterList extends ViewList {
  handleEvent({ gameContext, event }) {
    if (event.type == "resize") {
      this.resize(gameContext)
    }
    super.handleEvent({ gameContext, event })
  }

  add(gameContext, letter) {
    const newLetter = new LetterListItem(letter)

    this.push(newLetter)

    gameContext
      .animator
      .animate(newLetter)
      .tween({
        opacity: { from: 0 }
      })
      .start()

    this.children.sort((a, b) => a.letter.localeCompare(b.letter))
    this.children.forEach((child, index) => {
      const offset = this.getIndexOffset(index)

      if (child === newLetter) {
        child[this.isLandScape ? 'y' : 'x'] = 0
        child[this.isLandScape ? 'x' : 'y'] = offset
      }
      else {
        gameContext
          .animator
          .animate(child)
          .tween({
            [this.isLandScape ? 'y' : 'x']: 0,
            [this.isLandScape ? 'x' : 'y']: offset
          })
          .start()
      }
    })
  }

  getIndexOffset(index) {
    return index * this.spaceBetween  -(this.children.length - 1) / 2 * this.spaceBetween
  }

  resize(gameContext) {
    this.isLandScape = gameContext.width > gameContext.height

    if (this.isLandScape) {
      this.spaceBetween = Math.max(25, (gameContext.width - 200) / 29)
      this.x = 0
      this.y = -gameContext.height / 2 + 20

      this.children.forEach((child, index) => {
        child.x = this.getIndexOffset(index)
        child.y = 0
      })
    }
    else {
      this.spaceBetween = Math.max(25, (gameContext.height - 200) / 29)
      this.x = -gameContext.width / 2 + 20
      this.y = 0

      this.children.forEach((child, index) => {
        child.x = 0
        child.y = this.getIndexOffset(index)
      })

    }
  }
}
