/* eslint-disable react-hooks/exhaustive-deps */
import { h } from 'preact'
import style from './style'
import btnTry from 'img/btn-try.jpg'
import btnRecord from 'img/btn-record.jpg'
import btnTryDisable from 'img/btn-try-disable.jpg'
import btnTryPlaying from 'img/btn-try-playing.jpg'

import Touch from './touch'
import { getNow } from 'util/dom'
import PCMWave from 'com/pcm-wave'
import Recorder from 'lib/recorder'
import BtnIconLabel from './btn-icon-label'
import shortTimeEnergy from 'lib/shortTimeEnergy'
import { useRef, useState, useEffect } from 'preact/hooks'

// import PCMWave from '../../../lib/pc-pcm-wave.js'
// import '../../../lib/pc-pcm-wave.css'

const MaxRecordTime = 15000
const NoiseVoiceWatershedWave = 2
const StateLockTime = 300

const line1Def = {
  p: 0.7,
  width: 1.3,
  color: 'rgba(255,255,255,1)',
  delay: 0,
}

const line2Def = {
  p: 0.7,
  width: 1,
  color: 'rgba(255,255,255,0.5)',
  delay: 0.45,
}

const stateMap = {
  idle: [
    { a: 0, ws: 0, ...line1Def },
    { a: 0, ws: 0, ...line2Def },
  ],
  noise: [
    { a: 4, ws: 9, ...line1Def },
    { a: 3, ws: 9, ...line2Def },
  ],
  voice: [
    { a: 9, ws: 11, ...line1Def },
    { a: 7, ws: 11, ...line2Def },
  ],
}

function Home() {
  const waveRef = useRef()
  const audioRef = useRef()
  const recordBtnIconRef = useRef()

  const [tryPlaying, setTryPlaying] = useState(false)
  const [recordBlobUrl, setRecordBlobUrl] = useState()
  const [recordDisable, setRecordDisable] = useState(false)

  // 派生
  const tryBtnDisable = recordDisable || !recordBlobUrl

  const onAudioPlay = () => setTryPlaying(true)
  const onAudioEnded = () => setTryPlaying(false)
  const onTogglePlay = () => {
    if (!audioRef.current) return

    const $audio = audioRef.current
    $audio.src = recordBlobUrl

    if (!tryPlaying) {
      $audio.play().catch(e => console.log('play error', e))
    } else {
      $audio.pause()
      onAudioEnded()
    }
  }
  const onRecordTouchStart = () => {
    if (!recordBtnIconRef.current) return

    recordBtnIconRef.current.classList.add(style.recording)
  }
  const onRecordTouchEnd = async () => {
    if (!recordBtnIconRef.current) return

    recordBtnIconRef.current.classList.remove(style.recording)
    this.recordTimeout !== undefined && clearTimeout(this.recordTimeout)

    if (this.recordPressed) {
      this.recordPressed = false
      waveRef.current && waveRef.current.setState('idle')

      Recorder.instance.stop()

      const buffer = await Recorder.instance.toWAV()
      const blob = new Blob([new Uint8Array(buffer)], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)

      setRecordBlobUrl(url)
    }
  }
  const onRecordPress = () => {
    this.recordPressed = true
    const recorder = Recorder.instance

    audioRef.current.pause()
    onAudioEnded()

    this.lastWaveState = 'idle'
    this.lastWaveUpdateTime = getNow()
    this.recordStartTime = getNow()

    this.recordTimeout = setTimeout(() => onRecordTouchEnd(), MaxRecordTime)

    recorder.onAudioProcess = e => {
      const energy = shortTimeEnergy(e.inputBuffer.getChannelData(0).slice(0))
      const avg = energy.reduce((a, b) => a + b) / energy.length

      const nextState =
        Math.max(...energy) / avg > NoiseVoiceWatershedWave ? 'voice' : 'noise'

      if (
        getNow() - this.lastWaveUpdateTime > StateLockTime &&
        this.lastWaveState !== nextState
      ) {
        this.lastWaveState = 'idle'
        this.lastWaveUpdateTime = getNow()
        waveRef.current && waveRef.current.setState(nextState)
      }
    }
    recorder.record()
  }
  const onRecordError = error => {
    const errorStr = error.toString()

    if (~errorStr.indexOf('not_support')) alert('该WebView/浏览器不支持录音')
    if (~errorStr.indexOf('secure origins')) alert('请切换到HTTPS的链接')
    if (~errorStr.indexOf('Permission denied')) alert('获取授权失败')
  }

  useEffect(async () => {
    try {
      await Recorder.instance.init()
    } catch (error) {
      onRecordError(error)
      setRecordDisable(true)
    }
  }, [])

  return (
    <div class={style.home}>
      <h1 className={style.title}>PC-PCM-Wave</h1>

      <div className={style.card}>
        <div className={style.descTitle}>简单的波纹效果</div>
        <ol className={style.descText}>
          <li>可自定义状态数量</li>
          <li>可自定义线的数量、粗细、颜色、波速、振幅、延迟等参数</li>
        </ol>
        <div className={style.waveCan}>
          <PCMWave className={style.wave} ref={waveRef} stateMap={stateMap} />
        </div>
      </div>

      <div className={style.bottomCan}>
        <BtnIconLabel
          icon={
            tryBtnDisable ? btnTryDisable : tryPlaying ? btnTryPlaying : btnTry
          }
          label="试听"
          disable={tryBtnDisable}
          onClick={onTogglePlay}
          onDisableClick={() => alert('请先录制才能试听')}
        />
        <Touch
          onLongPress={onRecordPress}
          onTouchEnd={onRecordTouchEnd}
          onTouchStart={onRecordTouchStart}
        >
          <BtnIconLabel
            icon={btnRecord}
            label="长按录音"
            className={style.btnRecord}
            disable={recordDisable}
            iconRef={recordBtnIconRef}
          />
        </Touch>
      </div>

      <audio ref={audioRef} onPlay={onAudioPlay} onEnded={onAudioEnded} />
    </div>
  )
}

export default Home
