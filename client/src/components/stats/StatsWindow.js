import React from 'react'
import styled from 'styled-components'

const pointerLength = 10

const StyledStatsWindow = styled.div`
  position: absolute;
  bottom: ${props => props.bottom + pointerLength}%;
  left: ${props => props.center}%;
  transform: translate(-50%, -60%);
  border-radius: 1rem;
  background-color: white;
  padding: 1rem;
  font-size: 1.4rem;
  box-shadow: 0 0 1rem #000;
`
const Pointer = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  height: 1rem;
  width: ${pointerLength}px;
  background-color: white;
  transform: translate(-50%, 50%) rotate(45deg);
`
const Text = styled.p`
  color: ${props => props.color || '#000'};
`

export default function StatsWindow(props) {
  const { bottom, center, values } = props
  return (
    <StyledStatsWindow bottom={bottom} center={center}>
      <Pointer />
      {values &&
        values.map(v => (
          <Text color={v.color}>
            {v.title} : {v.text}
          </Text>
        ))}
    </StyledStatsWindow>
  )
}
