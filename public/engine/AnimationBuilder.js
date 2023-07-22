import deepClone from "../utils/deepClone.js"

function joinCallbacks(...callbacks) {
  return () => {
    return callbacks.reduce((chain, callback) => {
      return callback ? chain.then(callback) : chain
    }, Promise.resolve())
  }
}

export default class AnimationBuilder {
  constructor(animator, target) {
    this.animator = animator
    this.target = target
    this.tweens = []
  }

  tween(values, duration = 200, ease) {
    this.tweens.push({
      target: this.target,
      values,
      duration,
      ease,
    })

    return this
  }

  wait(duration) {
    this.tweens.push({ duration })

    return this
  }

  then(onFulfilled) {
    if (!this.tweens.length) {
      throw new Error('You need to add at least one tween before calling `then`')
    }
    const lastTween = this.tweens.at(-1)
    lastTween.callback = joinCallbacks(lastTween.callback, onFulfilled)

    return this
  }

  start(onFulfilled) {
    return new Promise((resolve) => {
      this.tweens.forEach((tween, index) => {
        if (index !== this.tweens.length - 1) {
          const nextTween = this.tweens[index + 1]
          tween.callback = joinCallbacks(tween.callback, () => {
            this.animator.push(nextTween)
          })
        }
        else {
          tween.callback = joinCallbacks(tween.callback, onFulfilled, resolve)
        }
      })

      this.animator.push(this.tweens[0])
    })
  }

  clone() {
    const clone = new AnimationBuilder(this.animator, this.target)
    clone.tweens = this.tweens.map(tween => ({
      ...tween,
      values: deepClone(tween.values)
    }))
    return clone
  }

  async loop(times = Infinity, onFulfilled) {
    if (times === Infinity && onFulfilled) {
      throw new Error('onFulfilled cannot be used with an infinite looping animation')
    }

    while (times > 0) {
      const clone = this.clone()
      await clone.start()
      times --
    }

    if (onFulfilled) await onFulfilled()
  }
}
