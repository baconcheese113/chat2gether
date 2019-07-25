import React from 'react'
import styled from 'styled-components'

const StyledChoiceSlider = styled.div`
  border-radius: 500rem; /* Large number to ensure rounded ends */
  width: ${({ width }) => width || '70%'};
  margin: 1rem auto;
  background-color: ${props => props.theme.colorGreyDark1};
  display: flex;
  justify-content: space-around;
  position: relative;
  border: 2px solid ${props => props.theme.colorPrimary};
  cursor: pointer;
`

const Option = styled.span`
  border: none;
  border-radius: 3rem;
  width: 100%;
  padding: ${({ height }) => height || '1rem'} 0;
  margin: 0;
  opacity: 0.8;
  z-index: 10;
  color: ${props => (props.active ? 'white' : props.theme.colorPrimaryLight)};

  &:active,
  &:focus {
    background-color: transparent;
  }
`

const Slider = styled.div`
  background-image: linear-gradient(
    to bottom right,
    ${props => props.theme.colorPrimary},
    ${props => props.theme.colorGreyDark1}
  );
  position: absolute;
  width: ${props => 100 / props.choices.length}%;
  top: 0;
  bottom: 0;
  left: ${props => (props.selected / props.choices.length) * 100}%;
  border-radius: 500rem;
  z-index: 1;
  transition: all 0.8s;
`

const ChoiceSlider = props => {
  const { cur, change, choices } = props
  // props.choices is a list of strings to display as choices
  // props.cur is the selected element
  // props.change is how to change the cur selected element

  const renderOptions = () => {
    const options = []
    for (const [index, choice] of choices.entries()) {
      options.push(
        <Option {...props} active={cur === index} onClick={() => change(index)} key={index}>
          {choice.replace(/_/g, ' ')}
        </Option>,
      )
    }
    return options
  }

  return (
    <StyledChoiceSlider {...props}>
      {renderOptions()}
      <Slider {...props} selected={cur} />
    </StyledChoiceSlider>
  )
}
export default ChoiceSlider
