import AnimationBuilder from './AnimationBuilder.js'

export default class Animator {
  constructor(startTime) {
    this.tweens = []
    this.time = startTime
  }

  animate(target) {
    return new AnimationBuilder(this, target)
  }

  wait(duration, key) {
    return new Promise(res => {
      const animation = {
        key,
        duration,
        callback: res,
      }
      this.push(animation)
    })
  }

  cancel(tween) {
    this.tweens = this.tweens.filter(other => other !== tween)
  }

  cancelTarget(target) {
    this.tweens = this.tweens.filter(tween => tween.target !== target)
  }

  cancelKey(key) {
    this.tweens = this.tweens.filter(tween => tween.key !== key)
  }

  push(...tweens) {
    tweens.forEach(tween => {
      tween.values ||= {}

      // Set start time, and start values for each animation
      tween.startTime = this.time

      if (typeof tween.values !== 'function') {
        Object.entries(tween.values).forEach(([name, options]) => {
          if (typeof options !== "object") {
            tween.values[name] = { to: options }
          }
        })
      }
    })

    this.tweens.push(...tweens)
  }

  update({ dT }) {
    this.time += dT
    const dropTweens = []

    this.tweens.forEach((tween) => {
      // Update all values
      const aDT = this.time - tween.startTime
      const t = Math.min(aDT / tween.duration, 1)
      const tEased = tween.ease ? tween.ease(t) : t

      if (typeof tween.values === 'function') {
        const values = tween.values(tEased)
        if (values) {
          Object.entries(values).forEach(([name, value]) => {
            tween.target[name] = value
          })
        }
      }
      else {
        Object.entries(tween.values).forEach(([name, options]) => {
          if (options.from === undefined) options.from = tween.target[name]
          if (options.to === undefined) options.to = tween.target[name]

          const dv = options.to - options.from
          tween.target[name] = options.from + dv * tEased
        })
      }

      if (t === 1) {
        dropTweens.push(tween)
        tween.callback?.call()
      }
    })

    this.tweens = this.tweens.filter(tween => !dropTweens.includes(tween))
  }
}
