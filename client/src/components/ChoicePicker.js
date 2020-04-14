import React from 'react'
import styled from 'styled-components'

const StyledChoicePicker = styled.div`
  border-radius: 500rem; /* Large number to ensure rounded ends */
  width: ${p => p.width || '90%'};
  margin: 1rem auto;
  outline: none;
  background-color: ${p => p.theme.colorGreyDark1};
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  position: relative;
  border: 2px solid ${p => p.theme.colorWhite1};
  font-size: ${p => p.fontSize || '1.6rem'};
  cursor: pointer;
`

const Option = styled.span`
  ${p => (p.optionStart ? 'border-radius: 3rem 0 0 3rem;' : '')}
  ${p => (p.optionEnd ? 'border-radius: 0 3rem 3rem 0;' : '')}
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${p => p.height || '1rem'} 0;
  border-right: ${p => (p.showBorderRight ? `2px solid ${p.theme.colorWhite1}` : undefined)};
  color: ${p => (p.active ? 'white' : p.theme.colorPrimaryLight)};
  ${p => (p.active ? `background-color: ${p.theme.colorPrimary};` : '')}
  font-size: ${p => (p.active ? '1.2rem' : '1rem')};
  transition: all .6s;
`
const OptionText = styled.span`
  opacity: ${p => (p.active ? 1 : 0.2)};
  user-select: none;
`

export default function ChoicePicker(props) {
  const { selected, onChange, choices, height, width, fontSize, 'data-cy': dataCy } = props
  // props.choices is a list of strings to display as choices
  // props.selected is a list of the selected choices
  // props.onChange is how to change the selected elements

  const handleClick = (e, choice) => {
    e.preventDefault()
    if (selected.find(obj => obj.name === choice)) {
      if (selected.length <= 1) return
      onChange(selected.filter(obj => obj.name !== choice))
    } else {
      onChange([...selected, { name: choice }])
    }
  }

  return (
    <StyledChoicePicker data-cy={dataCy} fontSize={fontSize} width={width}>
      {choices.map((choice, index) => {
        const active = selected.find(obj => obj.name === choice)
        return (
          <Option
            key={choice}
            active={active}
            data-cy={active && 'picker-active'}
            height={height}
            optionEnd={index === choices.length - 1}
            optionStart={index === 0}
            showBorderRight={index < choices.length - 1}
            onClick={e => handleClick(e, choice)}
          >
            <OptionText active={active}>{choice.replace(/_/g, ' ')}</OptionText>
          </Option>
        )
      })}
    </StyledChoicePicker>
  )
}
