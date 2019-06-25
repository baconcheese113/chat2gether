import React from 'react'
import styled, { css } from 'styled-components'

const StyledNumberSlider = styled.div`
  width: ${({ width }) => width || '90'}%;
  margin: 3rem auto 1rem;
  position: relative;
  display: flex;
  align-items: center;
`
const thumbMixin = css`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-image: linear-gradient(
    to bottom right,
    ${props => props.theme.colorPrimary},
    ${props => props.theme.colorGreyDark1}
  );
  cursor: pointer;
  position: relative;
  z-index: 1;
`

const trackMixin = css`
  background-color: ${props => props.theme.colorPrimary};
  border-radius: 500rem; /* Arbitrarily high number */
  height: 3px;
  display: flex;
  align-items: center;
`

const Slider = styled.input`
  appearance: none;
  background-image: linear-gradient(
    to bottom right,
    ${props => props.theme.colorPrimary},
    ${props => props.theme.colorGreyDark1}
  );
  position: absolute;
  width: 100%;
  height: 1rem;
  box-shadow: ${({ active }) => (active ? '0 0 1rem #fff' : '')};
  transition: all 0.8s;

  &,
  &::-webkit-slider-runnable-track,
  &::-webkit-slider-thumb {
    appearance: none;
    background: none;
  }

  &,
  &::-moz-range-track
  &::-moz-range-progress,
  &::-moz-range-thumb {
    -moz-appearance: none;
    background: none;
  }

  &::-moz-range-progress {
    display: none;
  }

  /* Number above slider */
  &::before {
    content: "${props => props.value}";
    font-size: 2rem;
    display: inline-block;
    text-align: center;
    position: absolute;
    bottom: 130%;
    left: ${props => props.left * 98}%;
    color: ${props => props.theme.colorPrimaryLight};
    z-index: 10;
  }
    
  /* Number effect on click */
  &:active::before {
    font-size: 4rem;
  }

  /* First slider is visible */
  &:nth-child(1)::-webkit-slider-runnable-track {
    ${trackMixin};
  }
  &:nth-child(1)::-moz-range-track {
    ${trackMixin};
  }
  &:nth-child(1)::-ms-track {
    ${trackMixin};
  }

  &::-ms-fill-lower,
  &::-ms-fill-upper {
    ${trackMixin};
  }

  /* Thumb for sliders */
  &::-webkit-slider-thumb {
    appearance: none;
    ${thumbMixin};
  }

  &::-moz-range-thumb {
    ${thumbMixin};
  }

  &::-ms-thumb {
    ${thumbMixin};
  }

  /* Thumb on first slider should be higher in z order */
  &:nth-child(1)::-webkit-slider-thumb {
    z-index: 2;
  }
  &:nth-child(1)::-moz-range-thumb {
    z-index: 2;
  }
  &:nth-child(1)::-ms-thumb {
    z-index: 2;
  }
`

const SliderFill = styled.div`
  position: absolute;
  background-color: ${props => props.theme.colorPrimaryLight};
  left: ${props => props.left}%;
  right: ${props => props.right}%;
  top: 0;
  height: 3px;
  z-index: 0;
`

const NumberSlider = props => {
  const { numbers, change, showFill } = props
  const MIN_AGE = 18
  const MAX_AGE = 90

  const getPercentFromValue = val => (val - MIN_AGE) / (MAX_AGE - MIN_AGE)

  const renderSliders = () => {
    const sliders = []
    for (const [index, number] of numbers.entries()) {
      sliders.push(
        <Slider
          key={index}
          type="range"
          min={MIN_AGE}
          max={MAX_AGE}
          value={number}
          title={number}
          left={getPercentFromValue(number)}
          onChange={e => {
            const newNumbers = [...numbers]
            if (numbers.length === 1) {
              newNumbers[index] = parseInt(e.target.value, 10)
            } else if (index === 0 && e.target.value < newNumbers[1]) {
              newNumbers[0] = parseInt(e.target.value, 10)
            } else if (index === 1 && e.target.value > newNumbers[0]) {
              newNumbers[1] = parseInt(e.target.value, 10)
            }
            change(newNumbers)
          }}
        />,
      )
    }
    if (showFill && numbers.length > 1) {
      sliders.push(
        <SliderFill
          key={1000}
          left={getPercentFromValue(numbers[0]) * 100}
          right={(1 - getPercentFromValue(numbers[1])) * 100}
        />,
      )
    }
    return sliders
  }

  return <StyledNumberSlider>{renderSliders()}</StyledNumberSlider>
}

export default NumberSlider
