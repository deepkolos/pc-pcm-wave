// const prefix = ['Moz', 'ms', 'webkit', 'O', 'KHTML'];
// const prefix = ['Moz', 'ms', 'webkit']
// const prefixAttrs = [
//   'transform',
//   'transition',
//   'transitionDuration',
//   'transformOrigin',
//   'clipPath',
// ]

export const rFA =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame

export const tranX = x => `translateX(${x}px)`
export const tranY = y => `translateY(${y}px)`
// export const tran = (x, y) => `translate(${x}px, ${y}px)`
// export const tranX3D = x => `translateX(${x}px) translateZ(0)`
// export const tranY3D = y => `translateY(${y}px) translateZ(0)`
// export const tran3D = (x, y, z = 0) => `translate(${x}px, ${y}px, ${z}px)`

// TODO: prefix只检测一次就可以了
// export const transform = $el => {
//   const { style } = $el
//   return prefixAttrs.reduce((obj, k) => {
//     obj[k] = val => {
//       style[k] = val
//       prefix.forEach(pre => {
//         style[pre + k.charAt(0).toUpperCase() + k.slice(1)] = val
//       })

//       let thenCb
//       let duringCb
//       let offListener
//       const chain = {
//         finished: false,
//         then: cb => {
//           thenCb = cb
//           return chain
//         },
//         during: cb => {
//           duringCb = cb
//           return chain
//         },
//         cancel: () => {
//           chain.finished = true
//           offListener()
//         },
//       }

//       setTimeout(() => {
//         if (thenCb && !duringCb) {
//           offListener = once($el, 'transitionend', thenCb)
//         } else if (duringCb) {
//           const frame = () => {
//             if (chain.finished) return
//             duringCb($el)
//             rFA(frame)
//           }

//           offListener = once($el, 'transitionend', () => {
//             thenCb && thenCb()
//             chain.finished = true
//           })

//           frame()
//         }
//       })
//       return chain
//     }
//     return obj
//   }, {})
// }

// export const once = function (el, event, fn) {
//   let cancelled = false
//   const canceller = function () {
//     if (cancelled) return

//     cancelled = true
//     off(el, event, listener)
//   }
//   const listener = function () {
//     if (fn) {
//       // eslint-disable-next-line prefer-rest-params
//       fn.apply(this, arguments)
//     }
//     canceller()
//   }

//   on(el, event, listener)
//   return canceller
// }

// export const on = (() => {
//   if (document.addEventListener) {
//     return (element, event, handler, useCapture = false) => {
//       if (element && event && handler) {
//         element.addEventListener(event, handler, useCapture)
//       }
//     }
//   } else {
//     return (element, event, handler) => {
//       if (element && event && handler) {
//         element.attachEvent('on' + event, handler)
//       }
//     }
//   }
// })()

// export const off = (() => {
//   if (document.removeEventListener) {
//     return (element, event, handler, useCapture = false) => {
//       if (element && event) {
//         element.removeEventListener(event, handler, useCapture)
//       }
//     }
//   } else {
//     return (element, event, handler) => {
//       if (element && event) {
//         element.detachEvent('on' + event, handler)
//       }
//     }
//   }
// })()

// export const rFAWithLock = (() => {
//   let _frameLock = false
//   let _arg
//   const wrapCB = cb => {
//     return () => {
//       cb(_arg)
//       _frameLock = false
//     }
//   }

//   return cb => {
//     if (!_frameLock) {
//       rFA(wrapCB(cb))
//     }
//     return arg => {
//       _arg = arg
//     }
//   }
// })()

export const getNow = () => {
  return window.performance && window.performance.now
    ? window.performance.now() + window.performance.timing.navigationStart
    : +new Date()
}

const easeOutQuint = t => 1 + --t * t * t * t * t

export const animate = (
  src,
  dst,
  duration,
  translate,
  easeFn = easeOutQuint,
) => {
  const startTime = getNow()
  const destTime = startTime + duration
  let doneCB
  const status = {
    isAnimating: true,
    animateTimer: null,
    cancel: () => {
      status.isAnimating = false
      return status
    },
    finish: () => {
      translate(dst)
      doneCB instanceof Function && doneCB()
    },
    then: cb => {
      doneCB = cb
      return status
    },
  }

  const step = () => {
    if (!status.isAnimating) return

    let now = getNow()

    if (now >= destTime || !duration) {
      status.isAnimating = false
      cancelAnimationFrame(status.animateTimer)
      translate(dst)
      doneCB instanceof Function && doneCB()
      return
    }
    now = (now - startTime) / duration
    const easing = easeFn(now)
    const curr = Object.keys(src).reduce((acc, k) => {
      acc[k] = (dst[k] - src[k]) * easing + src[k]
      return acc
    }, {})
    translate(curr)

    if (status.isAnimating) {
      status.animateTimer = rFA(step)
    }
  }

  step()

  return status
}
