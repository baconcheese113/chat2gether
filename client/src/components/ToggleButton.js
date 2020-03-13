import React from 'react'
import styled from 'styled-components'
import { Button } from './common'

const StyledToggleButton = styled.div`
  display: flex;
  position: relative;
  height: 45px;
  width: 45px;
  color: ${p => p.theme.colorPrimaryLight};
  margin-left: 0.5rem;
`
const ButtonElem = styled(Button)`
  padding: 0;
  border-radius: 50%;
  /* background-color: ${p => (p.active ? p.theme.colorPrimary : p.theme.colorGreyDark2)}; */
  background-image: linear-gradient(
    to bottom right,
    ${p => p.theme.colorPrimary},
    ${p => p.theme.colorGreyLight3}
  );
  filter: grayscale(${p => (p.active ? '0%' : '90%')});
`

const Notification = styled.p`
  color: #fff;
  position: absolute;
  top: 0;
  right: 0;
  background-color: red;
  font-size: 1.3rem;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  pointer-events: none;
`

export default function ToggleButton(props) {
  const { title, iconClass, onClick, notification, active, dataCy } = props
  return (
    <StyledToggleButton data-cy={dataCy}>
      <ButtonElem flex onClick={onClick} active={active}>
        {title}
        {iconClass && <i className={iconClass} />}
      </ButtonElem>
      {notification > 0 && <Notification>{notification}</Notification>}
    </StyledToggleButton>
  )
}
