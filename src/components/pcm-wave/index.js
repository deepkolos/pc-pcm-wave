import style from './style'
import { animate, rFA } from 'util/dom'
import { useRef, useEffect } from 'preact/hooks'

/** 波浪参数
  已知一波动方程为sin(10πt-2x)的波长，频率，波速和周期是多少？
  波长 = 2 * 2π = 4π
  频率 = 10π / 2π = 5
  波速 = 频率 * 波长 = 20π
  周期 = 1 / 频率 = 0.2
 */

function PCMWave({ className, stateMap, transitionDuration = 500 }) {
  const canvasRef = useRef()

  this.toState = this.toState || stateMap.idle
  this.fromState = this.fromState || stateMap.idle

  const sin = (a, ws, p, vd, x, t) => {
    const fx = 1 / p
    const ft = ws / fx
    return this.ratio * a * Math.sin(ft * t - (fx * x) / 0.7) + vd
  }

  const drawLines = t => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvasRef.current.getContext('2d')
    const { height: canvasH, width: canvasW } = canvas

    const percent = this.animPercent

    const { toState, fromState } = this

    fromState.forEach(({ p, width, color }, i) => {
      ctx.beginPath()
      ctx.lineWidth = width * this.ratio
      ctx.strokeStyle = color

      const sinY = (line, i, x) =>
        sin(
          line[i].a,
          line[i].ws,
          p,
          canvasH / 2,
          x / canvasW,
          t + line[i].delay,
        )

      for (let x = 0, y = 0; x <= canvasW; x++) {
        const fromY = sinY(fromState, i, x)
        const toY = sinY(toState, i, x)

        y = fromY * (1 - percent) + toY * percent
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }

      ctx.stroke()
      ctx.closePath()
    })
  }

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvasRef.current.getContext('2d')

    this.animPercent = 1
    this.ratio = window.devicePixelRatio || 2

    canvas.width = canvas.offsetWidth * this.ratio
    canvas.height = canvas.offsetHeight * this.ratio

    this.loop = t => {
      if (
        !this.destoryed &&
        !(this.animPercent === 1 && this.toState === stateMap.idle)
      ) {
        rFA(this.loop)
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawLines(t / 1000)
    }
    rFA(this.loop)

    return () => {
      this.destoryed = true
    }
  }, [])

  this.setState = state => {
    try {
      const to = state
      const from = this.lastState || 'idle'
      this.inited = true

      if (from === to) return
      this.anim && this.anim.cancel()
      this.fromState = stateMap[from]
      this.toState = stateMap[to]
      this.animPercent = 0
      this.loop(Date.now())
      this.anim = animate({ p: 0 }, { p: 1 }, transitionDuration, ({ p }) => {
        this.animPercent = p
      })
    } finally {
      this.lastState = state
    }
  }

  return (
    <canvas ref={canvasRef} className={`${style.pcPcmWave} ${className}`} />
  )
}

export default PCMWave
