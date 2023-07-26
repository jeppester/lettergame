import { easeInOutSine, easeInSine } from '../../engine/Tweens.js'
import ViewList from '../../engine/ViewList.js'
import LetterListItem from '../../shared/LetterListItem.js'

export default class LetterList extends ViewList {
  constructor(orderedLetters) {
    super()

    this.orderedLetters = orderedLetters
  }

  handleEvent({ gameContext, event }) {
    if (event.type == "resize") {
      this.resize(gameContext)
    }
    super.handleEvent({ gameContext, event })
  }

  add(gameContext, letter) {
    const offset = this.getLetterOffset(letter)
    const newLetter = new LetterListItem(letter)
    newLetter[this.isLandScape ? 'y' : 'x'] = 0
    newLetter[this.isLandScape ? 'x' : 'y'] = offset

    this.push(newLetter)

    gameContext
      .animator
      .animate(newLetter)
      .tween({
        opacity: { from: 0 },
        [this.isLandScape ? 'originY' : 'originX']: { from: 10 }
      })
      .start()

    this.children.sort((a, b) => a.letter.localeCompare(b.letter))
  }

  getLetterOffset(letter) {
    const index = this.orderedLetters.indexOf(letter)
    return index * this.spaceBetween  -(this.orderedLetters.length - 1) / 2 * this.spaceBetween
  }

  resize(gameContext) {
    this.isLandScape = gameContext.width > gameContext.height

    if (this.isLandScape) {
      this.spaceBetween = Math.max(25, (gameContext.width - 200) / 29)
      this.x = 0
      this.y = -gameContext.height / 2 + 20

      this.children.forEach((child) => {
        child.x = this.getLetterOffset(child.letter)
        child.y = 0
      })
    }
    else {
      this.spaceBetween = Math.max(25, (gameContext.height - 200) / 29)
      this.x = -gameContext.width / 2 + 20
      this.y = 0

      this.children.forEach((child) => {
        child.x = 0
        child.y = this.getLetterOffset(child.letter)
      })

    }
  }

  async celebrate(gameContext) {
    const { width, height, animator } = gameContext

    const radius = Math.min(width, height) * .37
    const letters = this.isLandScape ? this.children.slice().reverse() : this.children
    const firstLetter = letters[0]
    const initialAngle = Math.atan2(firstLetter.y + this.y, firstLetter.x + this.x)
    const initialDistance = Math.sqrt(Math.pow(firstLetter.x + this.x, 2) + Math.pow(firstLetter.y + this.y, 2))
    const totalLetters = this.length
    const letterSpacingRad = 2 * Math.PI / totalLetters
    const letterSpacing = radius * letterSpacingRad
    let firstLetterVelocity
    const inDuration = 1500

    // Make letters follow their predecessor by constraining the distance between them
    const updateChain = (letters) => {
      let [prevLetter, ...otherLetters] = letters
      otherLetters.forEach((letter) => {
        const distVec = [letter.x - prevLetter.x, letter.y - prevLetter.y]
        const dist = Math.sqrt(Math.pow(distVec[0], 2) + Math.pow(distVec[1], 2))
        if (dist > letterSpacing) {
          const angle = Math.atan2(distVec[1], distVec[0])
          let nextX = prevLetter.x + Math.cos(angle) * letterSpacing
          let nextY = prevLetter.y + Math.sin(angle) * letterSpacing

          // Enforce the radius as the minimum distance to the center point
          // to ensure that the letters won't "drag" each other inside the circle
          const nextCenterDist = Math.sqrt(Math.pow(this.x + nextX, 2) + Math.pow(this.y + nextY, 2))
          if (nextCenterDist < radius) {
            const distDiff = radius - nextCenterDist
            const angle = Math.atan2(this.y + nextY, this.x + nextX)
            nextX += Math.cos(angle) * distDiff
            nextY += Math.sin(angle) * distDiff
          }

          letter.x = nextX
          letter.y = nextY
        }

        prevLetter = letter
      })
    }

    // Animate first letter into the circle (using a quarter of a single)
    await animator
      .animate(this)
      .tween(t => {
        const distanceT = easeInOutSine(t)
        const angleT = easeInSine(t)

        const angle = initialAngle + angleT * Math.PI / 2
        const distanceD = (radius - initialDistance) * distanceT
        const distance = initialDistance + distanceD
        const centerX = Math.cos(angle) * distance
        const centerY = Math.sin(angle) * distance
        const firstLetterNextX = centerX - this.x
        const firstLetterNextY = centerY - this.y
        firstLetterVelocity = [firstLetter.x - firstLetterNextX, firstLetter.y - firstLetterNextY]
        firstLetter.x = firstLetterNextX
        firstLetter.y = firstLetterNextY

        // Make all other letters follow each other like a chain
        updateChain(letters)
      }, inDuration)
      .start()

    const endSpeedDerivative = Math.PI * Math.sin(Math.PI * 1 / 2) / 2
    const rotationTime =  inDuration / endSpeedDerivative * 4

    // Animate the first letter around the circle, with and (offset by a quarter of a circle)
    await animator
      .animate(this)
      .tween(t => {
        const angle = initialAngle + t * 2 * Math.PI + Math.PI / 2
        const centerX = Math.cos(angle) * radius
        const centerY = Math.sin(angle) * radius
        const firstLetterNextX = centerX - this.x
        const firstLetterNextY = centerY - this.y
        firstLetterVelocity = [firstLetter.x - firstLetterNextX, firstLetter.y - firstLetterNextY]
        firstLetter.x = firstLetterNextX
        firstLetter.y = firstLetterNextY

        // Make all other letters follow each other like a chain
        updateChain(letters)
      }, rotationTime)
      .loop()
  }
}
