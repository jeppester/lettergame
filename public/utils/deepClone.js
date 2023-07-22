export default function deepClone(object) {
  if (Array.isArray(object)) {
    return object.map(deepClone)
  }
  else if (typeof object === 'object' && object !== null) {
    const result = {}

    for (let [key, value] of Object.entries(object)) {
      result[key] = deepClone(value)
    }

    return result
  }
  else {
    return object
  }
}
