import React from 'react'
import styled from 'styled-components'

const StyledToggleButton = styled.button`
  height: 4.5rem;
  margin: 2px 0.5rem;
  border-radius: 50%;
  min-width: 4.5rem;
  background-image: linear-gradient(
    to bottom right,
    ${({ theme }) => theme.colorPrimary},
    ${({ theme }) => theme.colorGreyLight3}
  );
  background-color: ${({ active, theme }) => (active ? theme.colorPrimary : theme.colorGreyDark2)};
  color: ${props => props.theme.colorPrimaryLight};
  filter: grayscale(${props => (props.active ? '0%' : '90%')});

  margin-left: ${props => (props.right ? 'auto' : '.5rem')};
`

const ToggleButton = props => {
  const { title, iconClass, onClick } = props
  return (
    <StyledToggleButton onClick={onClick} {...props}>
      {title}
      {iconClass ? <i className={iconClass} /> : ''}
    </StyledToggleButton>
  )
}

export default ToggleButton
