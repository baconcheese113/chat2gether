import React from 'react'
import styled from 'styled-components'

const StyledHeader = styled.header`
  text-align: center;
  background-color: transparent;
  padding: 10px;
  font-size: 1.4rem;
  text-shadow: 0 0 2rem #111;
`
const Title = styled.h1`
  color: #9932cc;
  font-family: 'Megrim', cursive;
`

export default function Header() {
  return (
    <StyledHeader>
      <Title>Chat2Gether</Title>
    </StyledHeader>
  )
}
