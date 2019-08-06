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
  position: relative;
  border: 2px solid ${props => props.theme.colorPrimary};
  font-size: ${props => props.fontSize || '1.6rem'};
  cursor: pointer;
`

const Option = styled.span`
  border: none;
  border-radius: 0;
  ${props => (props.optionStart ? 'border-radius: 3rem 0 0 3rem;' : '')}
  ${props => (props.optionEnd ? 'border-radius: 0 3rem 3rem 0;' : '')}
  width: 100%;
  padding: ${({ height }) => height || '1rem'} 0;
  margin: 0;
  opacity: 0.8;
  z-index: 10;
  color: ${props => (props.active ? 'white' : props.theme.colorPrimaryLight)};
  ${props => (props.active ? `background-color: ${props.theme.colorPrimary};` : '')}
  transition: all .6s;
`

const ChoicePicker = props => {
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

  const renderOptions = () => {
    const options = []
    for (const [index, choice] of choices.entries()) {
      options.push(
        <Option
          {...props}
          optionStart={index === 0}
          optionEnd={index === choices.length - 1}
          active={selected.find(obj => obj.name === choice)}
          onClick={e => handleClick(e, choice)}
          key={index}
        >
          {choice.replace(/_/g, ' ')}
        </Option>,
      )
    }
    return options
  }

  return <StyledChoicePicker {...props}>{renderOptions()}</StyledChoicePicker>
}

export default ChoicePicker
