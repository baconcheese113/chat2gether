import React from 'react'
import styled from 'styled-components'
import Slider from '@material-ui/core/Slider'

const StyledNumberSlider = styled.div`
  width: ${({ width }) => width || '90'}%;
  margin: 3rem auto 1rem;
  position: relative;
  display: flex;
  align-items: center;
`

const StyledSlider = styled(Slider)`
  color: ${props => props.theme.colorPrimary};

  & .slider-label {
    font-size: 2rem;
  }
`

const NumberSlider = props => {
  const { numbers, change } = props
  const MIN_AGE = 18
  const MAX_AGE = 90

  const handleSliderChange = (e, newValue) => {
    change(newValue)
  }

  return (
    <StyledNumberSlider>
      <StyledSlider
        classes={{ valueLabel: 'slider-label' }}
        value={numbers}
        onChange={handleSliderChange}
        defaultValue={numbers}
        valueLabelDisplay="on"
        aria-labelledby="range-slider"
        getAriaValueText={val => `${val} years`}
        max={MAX_AGE}
        min={MIN_AGE}
      />
    </StyledNumberSlider>
  )
}

export default NumberSlider
