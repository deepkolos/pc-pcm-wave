/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-arrow-callback */
let patched = false
export default function patch() {
  if (patched) return
  patched = true
  if (
    typeof window.MediaStream === 'undefined' &&
    typeof window.webkitMediaStream !== 'undefined'
  ) {
    window.MediaStream = window.webkitMediaStream
  }

  if (
    typeof window.AudioContext === 'undefined' &&
    typeof window.webkitAudioContext !== 'undefined'
  ) {
    window.AudioContext = window.webkitAudioContext
  }

  if (
    typeof MediaStream !== 'undefined' &&
    !('stop' in MediaStream.prototype)
  ) {
    MediaStream.prototype.stop = function () {
      this.getTracks().forEach(function (track) {
        track.stop()
      })
    }
  }
}
