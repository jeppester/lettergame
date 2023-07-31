export default function playAudio(context, audioBuffer, volume = 1, loop = false) {
  let gainNode

  const source = context.createBufferSource()
  if (loop) source.loop = true

  source.buffer = audioBuffer

  if (volume !== 1) {
    gainNode = context.createGain()
    gainNode.gain.value = volume
    source.connect(gainNode)
    gainNode.connect(context.destination)
  }
  else {
    source.connect(context.destination)
  }

  const endPlayback = () => {
    source.stop()
    if (gainNode) {
      gainNode.disconnect()
    }
    source.disconnect()
  }

  const promise = new Promise((resolve) => {
    source.addEventListener('ended', () => {
      endPlayback()
      resolve()
    })

    source.start(0)
  })

  promise.cancel = endPlayback

  return promise
}
