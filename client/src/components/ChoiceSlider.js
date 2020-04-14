import React from 'react'
import styled from 'styled-components'

const StyledChoiceSlider = styled.div`
  width: ${p => p.width || '90%'};
  margin: 1rem auto;
  background-color: ${p => p.theme.colorGreyDark1};
  border: 2px solid ${p => p.theme.colorWhite1};
  border-radius: ${p => (p.vertical ? 20 : 5000)}px; /* Large number to ensure rounded ends */
  position: relative;
  font-size: ${p => p.fontSize || 'inherit'};
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  display: grid;
  grid-template-columns: ${p => (p.vertical ? '1fr' : `repeat(${p.totalChoices}, 1fr)`)};
  grid-template-rows: ${p => (p.vertical ? `repeat(${p.totalChoices}, 1fr)` : '1fr')};
`
const Option = styled.div`
  border: none;
  border-radius: 3rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${p => p.height || '1rem'} 0; /* 16px looks better */
  margin: 0;
  opacity: 0.8;
  color: ${p => (p.active ? 'white' : p.theme.colorPrimaryLight)};
  opacity: ${p => (p.active ? 1 : 0.3)};
  user-select: none;
  z-index: 10;

  &:active,
  &:focus {
    background-color: transparent;
  }
`

const Slider = styled.div`
  background-color: ${p => p.theme.colorPrimary};
  position: absolute;
  width: ${p => (p.vertical ? 100 : 100 / p.choices.length)}%;
  height: ${p => (p.vertical ? 100 / p.choices.length : 100)}%;
  top: ${p => (p.vertical ? (p.selected / p.choices.length) * 100 : 0)}%;
  bottom: 0;
  left: ${p => (p.vertical ? 0 : (p.selected / p.choices.length) * 100)}%;
  border-radius: ${p => p.sliderBorderRadius};
  transition: all ${p => (p.vertical ? 0.4 : 0.8)}s;
`

export default function ChoiceSlider(props) {
  const { cur, onChange, choices, width, fontSize, vertical, 'data-cy': dataCy } = props
  // props.choices is a list of strings to display as choices
  // props.cur is the selected element
  // props.onChange is how to change the cur selected element

  const sliderBorderRadius = React.useMemo(() => {
    if (!vertical) return '5000px'
    if (cur > 0 && cur < choices.length - 1) return '0px'
    return `${cur === 0 ? '20px 20px' : '0px 0px'} ${cur === choices.length - 1 ? '20px 20px' : '0px 0px'}`
  }, [choices.length, cur, vertical])

  return (
    <StyledChoiceSlider
      data-cy={dataCy}
      fontSize={fontSize}
      totalChoices={choices.length}
      vertical={vertical}
      width={width}
    >
      <Slider choices={choices} selected={cur} sliderBorderRadius={sliderBorderRadius} vertical={vertical} />
      {choices.map((choice, index) => (
        <Option
          key={choice}
          active={cur === index}
          data-cy={cur === index ? 'slider-active' : null}
          onClick={() => onChange(index)}
        >
          {choice.replace(/_/g, ' ')}
        </Option>
      ))}
    </StyledChoiceSlider>
  )
}

ChoiceSlider.defaultProps = {
  fontSize: '12px',
}
