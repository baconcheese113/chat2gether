import React from 'react'
import styled from 'styled-components'

const StyledHeader = styled.header`
  text-align: center;
  background-color: transparent;
  padding: 10px;
  font-size: 1.4rem;
  text-shadow: 0 0 2rem #111;
`

export default function Header() {
  return (
    <StyledHeader>
      <h1>Chat2Gether</h1>
    </StyledHeader>
  )
}
