import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'

const StyledNumberSlider = styled.div`
  background-color: ${props => (props.active ? '#fff' : props.theme.colorGreyLight2)};
  width: ${({ width }) => width || '90'}%;
  margin: 3rem auto 1rem;
  height: 0.5rem;
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 500rem; /* Arbitrarily high number */
  box-shadow: ${({ active }) => (active ? '0 0 1rem #fff' : '')};
  transition: all 0.8s;
`

const Slider = styled.div`
  background-color: ${props => props.theme.colorPrimary};
  background-image: linear-gradient(
    to bottom right,
    ${props => props.theme.colorPrimary},
    ${props => props.theme.colorGreyDark1}
  );
  position: absolute;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  border-radius: 50%;
  z-index: 10;
  /* top: -50%; */
  left: calc(${props => props.left}% - 1rem);
`

const NumberDisplay = styled.p`
  font-size: 1rem;
  position: relative;
  bottom: 2rem;
  color: ${props => props.theme.colorPrimaryLight};
  transform: scale(${props => (props.active ? 2.5 : 1)});
  transition: all 0.4s;
`

const SliderFill = styled.div`
  position: absolute;
  background-color: ${props => props.theme.colorPrimaryLight};
  left: ${props => props.left}%;
  right: ${props => props.right}%;
  top: 0;
  bottom: 0;
`

const NumberSlider = props => {
  const { numbers, change, showFill } = props
  const MIN_AGE = 18
  const MAX_AGE = 99
  const mainSlider = useRef()
  const [box, setBox] = useState(null) // set to mainSlider's bounding box
  const [sliderIndex, setSliderIndex] = useState(-1) // Set above -1 when in use

  const numberToPercent = number => {
    return ((number - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100
  }
  const pixelToNumber = x => {
    const percent = Math.min(Math.max((x - box.left) / (box.right - box.left), 0), 1)
    return Math.round((MAX_AGE - MIN_AGE) * percent + MIN_AGE)
  }
  useEffect(() => {
    setBox(mainSlider.current.getBoundingClientRect())
  }, [])

  const startUpdating = (e, index) => {
    console.log('starting', e)
    setSliderIndex(index)
  }
  const stopUpdating = () => {
    console.log('stopped')
    setSliderIndex(-1)
  }
  const followUpdate = e => {
    if (sliderIndex < 0) {
      return
    }
    let intendedNum = null
    if (e.targetTouches) {
      intendedNum = pixelToNumber(e.targetTouches[0].clientX)
    } else if (e.clientX) {
      intendedNum = pixelToNumber(e.clientX)
    } else return
    // console.log(`${e.targetTouches[0].clientX} out of ${box.left} to ${box.right} making it ${intendedNum} length ${numbers.length} and index ${changingSliderIndex} for ${numbers}`) // looking for 70 and 630
    if (numbers.length === 1) {
      change([intendedNum])
      return
    }
    const newArr = [...numbers]
    if (sliderIndex === 0 && intendedNum >= numbers[1]) {
      newArr[0] = numbers[1] - 1
    } else if (sliderIndex === 1 && intendedNum <= numbers[0]) {
      newArr[1] = numbers[0] + 1
    } else {
      newArr[sliderIndex] = intendedNum
    }
    change([...newArr])
  }

  const renderSliders = () => {
    const sliders = []
    for (const [index, number] of numbers.entries()) {
      sliders.push(
        <Slider
          key={index}
          left={numberToPercent(number)}
          onTouchStart={e => startUpdating(e, index)}
          onMouseDown={e => startUpdating(e, index)}
          onTouchEnd={e => stopUpdating(e, index)}
          onMouseUp={e => stopUpdating(e, index)}
          onTouchMove={followUpdate}
          onMouseMove={followUpdate}
        >
          <NumberDisplay active={sliderIndex === index}>{number}</NumberDisplay>
        </Slider>,
      )
    }
    if (showFill && numbers.length > 1) {
      sliders.push(
        <SliderFill
          key={1000}
          left={numberToPercent(numbers[0])}
          right={100 - numberToPercent(numbers[numbers.length - 1])}
        />,
      )
    }
    return sliders
  }

  return (
    <StyledNumberSlider ref={mainSlider} active={sliderIndex > -1}>
      {renderSliders()}
    </StyledNumberSlider>
  )
}

export default NumberSlider
