# pc-pcm-wave

![https://travis-ci.com/deepkolos/pc-pcm-wave](https://travis-ci.com/deepkolos/pc-pcm-wave.svg?branch=master)
![](https://img.shields.io/npm/dt/pc-pcm-wave.svg)
![](https://img.shields.io/npm/v/pc-pcm-wave.svg)

一个简单的`pcm`波纹的工具可以只是多个状态, 线条样式波纹效果等, 适用于`preact`项目, `hooks`编写, 有如下特性

1. 可自定义状态数量
2. 可自定义线的数量、粗细、颜色、波速、振幅、延迟等参数


# Live Demo

[Link](https://deepkolos.github.io/pc-pcm-wave/)

![demo](https://raw.githubusercontent.com/deepkolos/pc-pcm-wave/master/demo.webp)

# Props

| 参数               | 类型     | 默认值 | 描述            |
| ------------------ | -------- | ------ | --------------- |
| stateMap           | StateMap |        | 默认参数        |
| className          | string   |        | 根元素className |
| transitionDuration | number   | 500    | 状态变换时长    |

### Props Type: StateMap

| 键名     | 键值  | 描述     |
| -------- | ----- | -------- |
| [string] | State | 状态配置 |

### Props Type: State

| 键名  | 键值   | 描述       |
| ----- | ------ | ---------- |
| a     | number | 振幅       |
| ws    | number | 波速       |
| p     | number | 频率       |
| width | number | 线宽度     |
| color | string | 线颜色     |
| delay | number | 延迟单位秒 |

# VM Public Methods

| 方法     | 参数              | 描述                             |
| -------- | ----------------- | -------------------------------- |
| setState | stateName(string) | 切换到stateMap的键值所对应的配置 |

# Demo Code

```jsx
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

function Page() {
  const waveRef = useRef()

  const onClick = () => {
    // 建议参考Demo的代码
    waveRef.current && waveRef.current.setState(Math.random() > 0.5 ? 'noise' : 'voice')
  }

  return <div onClick={onClick}>
    <PCMWave ref={waveRef} stateMap={stateMap} />
  </div>
}
```

# TODO

1. 增加更多效果

# License

MIT 造轮子锻炼抽象能力
