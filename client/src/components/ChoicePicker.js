import React from 'react'
import styled from 'styled-components'

const StyledChoicePicker = styled.div`
  border-radius: 500rem; /* Large number to ensure rounded ends */
  width: ${({ width }) => width || '90%'};
  margin: 1rem auto;
  outline: none;
  background-color: ${props => props.theme.colorGreyDark1};
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  position: relative;
  border: 2px solid ${props => props.theme.colorWhite1};
  font-size: ${props => props.fontSize || '1.6rem'};
  cursor: pointer;
`

const Option = styled.span`
  ${props => (props.optionStart ? 'border-radius: 3rem 0 0 3rem;' : '')}
  ${props => (props.optionEnd ? 'border-radius: 0 3rem 3rem 0;' : '')}
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ height }) => height || '1rem'} 0;
  z-index: 10;
  border-right: ${props => (props.showBorderRight ? `2px solid ${props.theme.colorWhite1}` : undefined)};
  color: ${props => (props.active ? 'white' : props.theme.colorPrimaryLight)};
  ${props => (props.active ? `background-color: ${props.theme.colorPrimary};` : '')}
  font-size: ${props => (props.active ? '1.2rem' : '1rem')};
  transition: all .6s;
`
const OptionText = styled.span`
  opacity: ${props => (props.active ? 1 : 0.2)};
`

export default function ChoicePicker(props) {
  const { selected, change, choices } = props
  // props.choices is a list of strings to display as choices
  // props.selected is a list of the selected choices
  // props.change is how to change the selected elements

  const handleClick = (e, choice) => {
    e.preventDefault()
    if (selected.find(obj => obj.name === choice)) {
      change(selected.filter(obj => obj.name !== choice))
    } else {
      change([...selected, { name: choice }])
    }
  }

  return (
    <StyledChoicePicker {...props}>
      {choices.map((choice, index) => (
        <Option
          {...props}
          key={choice}
          optionStart={index === 0}
          optionEnd={index === choices.length - 1}
          active={selected.find(obj => obj.name === choice)}
          onClick={e => handleClick(e, choice)}
          showBorderRight={index < choices.length - 1}
        >
          <OptionText active={selected.find(obj => obj.name === choice)}>{choice.replace(/_/g, ' ')}</OptionText>
        </Option>
      ))}
    </StyledChoicePicker>
  )
}
