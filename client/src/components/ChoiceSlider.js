import React from 'react'
import styled from 'styled-components'

const StyledChoiceSlider = styled.div`
  border-radius: 500rem; /* Large number to ensure rounded ends */
  width: ${p => p.width || '90%'};
  margin: 1rem auto;
  background-color: ${p => p.theme.colorGreyDark1};
  display: flex;
  justify-content: space-around;
  position: relative;
  border: 2px solid ${p => p.theme.colorWhite1};
  font-size: ${p => p.fontSize || 'inherit'};
  cursor: pointer;
`

const Option = styled.span`
  border: none;
  border-radius: 3rem;
  width: 100%;
  padding: ${p => p.height || '1rem'} 0;
  margin: 0;
  opacity: 0.8;
  color: ${p => (p.active ? 'white' : p.theme.colorPrimaryLight)};
  opacity: ${p => (p.active ? 1 : 0.3)};
  z-index: 10;

  &:active,
  &:focus {
    background-color: transparent;
  }
`

const Slider = styled.div`
  /* background-image: linear-gradient(
    to bottom right,
    ${p => p.theme.colorPrimary},
    ${p => p.theme.colorGreyDark1}
  ); */
  background-color: ${p => p.theme.colorPrimary};
  position: absolute;
  width: ${p => 100 / p.choices.length}%;
  top: 0;
  bottom: 0;
  left: ${p => (p.selected / p.choices.length) * 100}%;
  border-radius: 500rem;
  transition: all 0.8s;
  `

export default function ChoiceSlider(props) {
  const { cur, change, choices } = props
  // props.choices is a list of strings to display as choices
  // props.cur is the selected element
  // props.change is how to change the cur selected element

  return (
    <StyledChoiceSlider {...props}>
      <Slider choices={choices} selected={cur} />
      {choices.map((choice, index) => (
        <Option active={cur === index} onClick={() => change(index)} key={choice}>
          {choice.replace(/_/g, ' ')}
        </Option>
      ))}
    </StyledChoiceSlider>
  )
}
