/* eslint-disable class-methods-use-this */
import patch from './recorder-compact'

class Recorder {
  constructor() {
    this.inited = false
    this.jsNode = null
    this.mediaNode = null
    this.mediaStream = null
    this.audioContext = null
    this.audioBuffers = null
    this.onAudioProcess = null
    this.inputSampleRate = null
    this.outputSampleRate = null

    const unloadCB = window.onbeforeunload

    window.onbeforeunload = () => {
      this.destory()
      if (unloadCB) return unloadCB()
    }
  }

  static instance = new Recorder()

  async init(reinit) {
    if (this.inited && !reinit) return
    this.inited = true

    this.logEnv()
    patch()
    if (!this.support()) throw new Error('not_support')

    const mediaStream = await window.navigator.mediaDevices.getUserMedia({
      audio: {
        // sampleRate: 44100, // 采样率
        channelCount: 1, // 声道
        // echoCancellation: true,
        // noiseSuppression: true,
      },
    })
    if (!mediaStream) throw new Error('stream open fail')
    this.mediaStream = mediaStream
    return mediaStream
  }

  async initWorkers() {
    const { default: Worker } = await import('./recorder.worker')

    if (this.workerToInt16) return
    this.workerToInt16 = new Worker()
    this.workerToMP3 = new Worker()
    this.workerToWAV = new Worker()
    // 为了并行
  }

  destory() {
    this.workerToInt16 && this.workerToInt16.terminate()
    this.workerToMP3 && this.workerToMP3.terminate()
    this.mediaStream && this.mediaStream.stop()
  }

  support() {
    const devices = navigator.mediaDevices || {}

    devices.getUserMedia =
      devices.getUserMedia ||
      devices.webkitGetUserMedia ||
      devices.mozGetUserMedia ||
      devices.msGetUserMedia

    return !!devices.getUserMedia && window.Worker
  }

  logEnv() {
    console.log(`recorder info:
    AudioContext: ${!!window.AudioContext}
    webkitAudioContext: ${!!window.webkitAudioContext}
    mediaDevices: ${!!navigator.mediaDevices}
    mediaDevices.getUserMedia: ${!!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    )}
    navigator.getUserMedia: ${!!navigator.getUserMedia}
    navigator.webkitGetUserMedia: ${!!navigator.webkitGetUserMedia}`)
  }

  async record() {
    await this.init()

    if (this.recording) return
    this.recording = true

    // 重置存储
    this.audioBuffers = []

    if (!this.mediaStream) await this.init(true)

    // 打开stream
    this.audioContext = new window.AudioContext()
    this.inputSampleRate = this.audioContext.sampleRate
    this.mediaNode = this.audioContext.createMediaStreamSource(this.mediaStream)

    if (!this.audioContext.createScriptProcessor) {
      this.audioContext.createScriptProcessor = this.audioContext.createJavaScriptNode
    }
    // 创建一个jsNode
    this.jsNode = this.audioContext.createScriptProcessor(4096, 1, 1)
    this.jsNode.connect(this.audioContext.destination)
    this.jsNode.onaudioprocess = this._onAudioProcess.bind(this)
    this.mediaNode.connect(this.jsNode)
  }

  stop() {
    if (this.recording) {
      this.jsNode.disconnect()
      this.mediaNode.disconnect()
      this.jsNode.onaudioprocess = null
      this.jsNode = null
      this.mediaNode = null
      this.recording = false
    }
    return this.audioBuffers
  }

  // async toInt16(sampleRate = 16000, format = 'base64') {
  //   if (!this.workerToInt16) await this.initWorkers()

  //   return new Promise(resolve => {
  //     this.workerToInt16.postMessage({
  //       audioBuffers: this.audioBuffers,
  //       inputSampleRate: this.inputSampleRate,
  //       outputSampleRate: sampleRate,
  //       type: 'int16',
  //       format,
  //     })
  //     this.workerToInt16.onmessage = event => resolve(event.data)
  //   })
  // }

  // async toMP3(sampleRate = 16000) {
  //   if (!this.workerToMP3) await this.initWorkers()

  //   return new Promise(resolve => {
  //     this.workerToMP3.postMessage({
  //       audioBuffers: this.audioBuffers,
  //       inputSampleRate: this.inputSampleRate,
  //       outputSampleRate: sampleRate,
  //       type: 'mp3',
  //     })
  //     this.workerToMP3.onmessage = event => resolve(event.data)
  //   })
  // }

  async toWAV(sampleRate = 16000) {
    if (!this.workerToWAV) await this.initWorkers()

    return new Promise(resolve => {
      this.workerToWAV.postMessage({
        audioBuffers: this.audioBuffers,
        inputSampleRate: this.inputSampleRate,
        outputSampleRate: sampleRate,
        type: 'wav',
      })
      this.workerToWAV.onmessage = event => resolve(event.data)
    })
  }

  async toShortEnergy() {
    const { default: Worker } = await import('./recorder.worker')
    const worker = new Worker()

    return new Promise(resolve => {
      worker.postMessage({
        audioBuffers: this.audioBuffers,
        type: 'short-energy',
      })
      worker.onmessage = event => resolve(event.data)
    })
  }

  _onAudioProcess(e) {
    const audioBuffer = e.inputBuffer
    this.audioBuffers.push(audioBuffer.getChannelData(0).slice(0))

    this.onAudioProcess && this.onAudioProcess(e)
  }
}

export default Recorder
