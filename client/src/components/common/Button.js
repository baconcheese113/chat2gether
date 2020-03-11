import React from 'react'
import styled from 'styled-components'

const StyledButton = styled.button`
  flex: ${p => p.flex};
  border-radius: ${p => p.borderRadius};
  outline: none;
  border: #181818;
  text-align: center;
  background-color: ${p => p.backgroundColor};
  color: ${p => (p.disabled ? '#888' : '#fff')};
  padding: 5px 10px;
  cursor: ${p => (p.disabled ? 'default' : 'pointer')};
  font-size: ${p => p.fontSize};
  filter: ${p => p.disabled && 'brightness(0.8) grayscale(1)'};
  transition: all 0.4s;

  &:hover {
    text-shadow: ${p => !p.disabled && '0 0 2px #fff'};
    box-shadow: ${p => !p.disabled && '0 0 4px #555'};
  }
`

export default function Button(props) {
  const {
    className,
    label,
    flex,
    square,
    primary,
    light,
    h1,
    h2,
    h3,
    small,
    disabled,
    onClick,
    'data-cy': dataCy,
    children,
  } = props

  const backgroundColor = React.useMemo(() => {
    if (primary) return '#aa32cc'
    if (light) return '#555'
    return '#313131'
  }, [primary])

  const flexStyle = React.useMemo(() => {
    if (flex) return 1
    return
  }, [flex])

  const borderRadius = React.useMemo(() => {
    if (square) return '0px'
    return '10px'
  }, [square])

  const fontSize = React.useMemo(() => {
    if (h1) return '35px'
    if (h2) return '25px'
    if (h3) return '20px'
    if (small) return '14px'
    return '18px'
  }, [h1, h2, h3])

  return (
    <StyledButton
      type="button"
      flex={flexStyle}
      borderRadius={borderRadius}
      backgroundColor={backgroundColor}
      fontSize={fontSize}
      disabled={disabled}
      data-cy={dataCy}
      className={className}
      onClick={onClick}
    >
      {label || children}
    </StyledButton>
  )
}
