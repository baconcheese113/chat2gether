import React from 'react'
import styled from 'styled-components'
import Slider from '@material-ui/core/Slider'

const StyledNumberSlider = styled.div`
  width: ${p => p.width || '90'}%;
  margin: 3rem auto 1rem;
  position: relative;
  display: flex;
  align-items: center;
`

const StyledSlider = styled(Slider)`
  color: ${p => p.theme.colorPrimary1};

  & .MuiSlider-rail {
    color: ${p => p.theme.colorWhite1};
  }

  & .slider-label {
    font-size: 2rem;
  }
`

export default function NumberSlider(props) {
  const { numbers, change, dataCy } = props
  const MIN_AGE = 18
  const MAX_AGE = 90

  const handleSliderChange = (e, newValue) => {
    change(newValue)
  }

  return (
    <StyledNumberSlider>
      <StyledSlider
        classes={{ valueLabel: 'slider-label' }}
        data-cy={dataCy}
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
