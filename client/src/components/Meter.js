import React from 'react'
import styled, { keyframes } from 'styled-components'

const rotate = keyframes`
  from{transform: rotate(0)}
  to{transform: rotate(360deg)}
`

const MeterContainer = styled.div`
  position: fixed;
  top: 0;
  right: 5%;
  bottom: 0;
  width: 3rem;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const Bar = styled.div`
  background-color: ${p => p.theme.colorGreyLight2};
  border-radius: 500rem;
  min-height: 80%;
  width: 1rem;
  border-radius: 500rem;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Center = styled.div.attrs(({ speed }) => ({
  style: {
    animationDuration: `${speed}s`,
  },
}))`
  background-color: burlywood;
  background-image: linear-gradient(to bottom right, ${p => p.theme.colorPrimaryLight}, ${p => p.theme.colorPrimary});
  border-radius: 50% 0 50% 0;
  width: 3rem;
  height: 3rem;
  position: absolute;
  animation-name: ${rotate};
  animation-timing-function: linear;
  animation-iteration-count: infinite;
`

const MeterLabels = styled.p`
  font-size: 1.5rem;
  background-color: ${p => p.theme.colorGreyDark1};
  border-radius: 500rem;
  border: 1px dashed ${p => p.theme.colorPrimary};
  padding: 0.5rem 1rem;
  z-index: -1;
`

const BarFill = styled.div.attrs(({ isNewVal }) => ({
  style: {
    boxShadow: `0 0 1rem ${isNewVal ? '#fff' : 'transparent'}`,
  },
}))`
  position: absolute;
  background-color: orchid;
  background-image: linear-gradient(to bottom right, ${p => p.theme.colorPrimaryLight}, ${p => p.theme.colorPrimary});
  border-radius: 500rem;
  top: ${p => p.top || 0}%;
  bottom: ${p => p.bottom || 0}%;
  left: 0;
  right: 0;
`

const Slider = styled.button.attrs(p => ({
  style: {
    bottom: `calc(${p.bottom}% - .3rem)`,
  },
}))`
  background-color: ${p => p.theme.colorPrimary};
  background-image: linear-gradient(to bottom right, ${p => p.theme.colorPrimaryLight}, ${p => p.theme.colorPrimary});
  position: absolute;
  width: 3rem;
  height: 2rem;
  padding: 0;
  cursor: pointer;
  border-radius: 500rem;
  z-index: 10;
  display: flex;
  justify-content: center;
  transform: ${p => (p.active ? 'scale(1.8)' : 'scale(1)')};
  transition: transform 0.4s;
  box-shadow: 0 0 1rem #111;

  & i {
    font-size: 1.6rem;
    color: ${p => p.theme.colorGreyDark2};

    &:hover {
      text-shadow: none;
    }
  }
`

const BracketText = styled.p.attrs(p => ({
  style: {
    transform: `scale(${p.scale})`,
    opacity: p.opacity,
  },
}))`
  position: absolute;
  bottom: ${p => p.bottom}%;
  top: ${p => p.top}%;
  right: 400%;
  font-size: 2rem;
  text-shadow: 0 0 0.5rem #000;
  text-anchor: start;
  white-space: nowrap;
  transform-origin: right;
  transition: transform 0.4s, opacity 1.2s;
`

export default function Meter() {
  // const { numbers, change } = props
  const [box, setBox] = React.useState(null) // set to mainMeter's bounding box
  const [isSliding, setIsSliding] = React.useState(false)

  // Move to props
  const [number, setNumber] = React.useState(10)
  const [otherNum, setOtherNum] = React.useState(20)
  const [isNewVal, setIsNewVal] = React.useState(false)

  const mainMeter = React.useRef()

  const pixelToNumber = y => {
    const halfLength = (box.bottom - box.top) / 2
    const halfY = halfLength + box.top
    const percent = Math.min(Math.max(1 - (y - halfY) / halfLength, 0), 1)
    return percent * 100
  }

  const startUpdating = e => {
    console.log('starting', e)
    setIsSliding(true)
  }
  const stopUpdating = () => {
    console.log('stopped')
    setIsSliding(false)
  }
  const followUpdate = e => {
    // e.preventDefault() // Not working due to breaking changes in chrome...need to make sure page isn't scrollable
    if (!isSliding) {
      return
    }
    let intendedNum = null
    if (e.targetTouches) {
      intendedNum = pixelToNumber(e.targetTouches[0].clientY)
    } else if (e.clientX) {
      intendedNum = pixelToNumber(e.clientY)
    } else return
    // console.log(
    //   `${e.targetTouches[0].clientY} out of ${box.top} to ${box.bottom} making it ${intendedNum} for ${number}`,
    // )
    setNumber(intendedNum)
  }

  const changeOther = newVal => {
    setTimeout(() => {
      setIsNewVal(false)
    }, 2000)
    setOtherNum(newVal)
    setIsNewVal(true)
  }

  useEffect(() => {
    setBox(mainMeter.current.getBoundingClientRect())
    setInterval(() => {
      changeOther(Math.floor(Math.random() * 10) * 10)
    }, 4000)
  }, [])

  const getSliderDistNormal = (sliderVal, bracketVal) => {
    return 1 - Math.min(Math.max(Math.abs(sliderVal - bracketVal) / 40, 0), 1)
  }

  const bracketAttrs = [...new Array(5)].map((_, idx) => {
    const bottom = idx * 10
    const normal = getSliderDistNormal(number, bottom * 2)
    return {
      scale: normal,
      opacity: isSliding ? normal : 0,
      bottom,
    }
  })

  const otherAttrs = [...new Array(5)].map((_, idx) => {
    const top = idx * 10
    const normal = getSliderDistNormal(otherNum, top * 2)
    return {
      scale: normal,
      opacity: isNewVal ? normal : 0,
      top,
    }
  })

  return (
    <MeterContainer>
      <MeterLabels>Them</MeterLabels>
      <Bar ref={mainMeter}>
        <Center speed={number > 0 && !isSliding ? 20 / number : 2} />
        <BarFill bottom={100 - otherNum / 2} isNewVal={isNewVal} number={number} top={0} />
        <BarFill bottom={0} number={number} top={100 - number / 2} />
        <BracketText bottom={bracketAttrs[0].bottom} opacity={bracketAttrs[0].opacity} scale={bracketAttrs[0].scale}>
          Oh, we&apos;re starting?
        </BracketText>
        <BracketText bottom={bracketAttrs[1].bottom} opacity={bracketAttrs[1].opacity} scale={bracketAttrs[1].scale}>
          I think I like you!
        </BracketText>
        <BracketText bottom={bracketAttrs[2].bottom} opacity={bracketAttrs[2].opacity} scale={bracketAttrs[2].scale}>
          This is great!
        </BracketText>
        <BracketText bottom={bracketAttrs[3].bottom} opacity={bracketAttrs[3].opacity} scale={bracketAttrs[3].scale}>
          Oh wow, we should be friends!
        </BracketText>
        <BracketText bottom={bracketAttrs[4].bottom} opacity={bracketAttrs[4].opacity} scale={bracketAttrs[4].scale}>
          BFF&apos;s Forever!
        </BracketText>

        <BracketText opacity={otherAttrs[0].opacity} scale={otherAttrs[0].scale} top={otherAttrs[0].top}>
          Oh, we&apos;re starting?
        </BracketText>
        <BracketText opacity={otherAttrs[1].opacity} scale={otherAttrs[1].scale} top={otherAttrs[1].top}>
          I think I like you!
        </BracketText>
        <BracketText opacity={otherAttrs[2].opacity} scale={otherAttrs[2].scale} top={otherAttrs[2].top}>
          This is great!
        </BracketText>
        <BracketText opacity={otherAttrs[3].opacity} scale={otherAttrs[3].scale} top={otherAttrs[3].top}>
          Oh wow, we should be friends!
        </BracketText>
        <BracketText opacity={otherAttrs[4].opacity} scale={otherAttrs[4].scale} top={otherAttrs[4].top}>
          BFF&apos;s Forever!
        </BracketText>
        <Slider
          active={isSliding}
          bottom={number / 2}
          onMouseDown={e => startUpdating(e)}
          onMouseMove={followUpdate}
          onMouseUp={e => stopUpdating(e)}
          onTouchEnd={e => stopUpdating(e)}
          onTouchMove={followUpdate}
          onTouchStart={e => startUpdating(e)}
        >
          <i className="fas fa-grip-lines" />
        </Slider>
      </Bar>
      <MeterLabels>You</MeterLabels>
    </MeterContainer>
  )
}
