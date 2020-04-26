import React from 'react'
import styled, { keyframes } from 'styled-components'
import useWindowSize from '../hooks/WindowSizeHook'
import { Button } from './common'

const StyledToggleButton = styled.div`
  display: flex;
  position: relative;
  height: 45px;
  min-width: 45px;
  color: ${p => p.theme.colorPrimaryLight};
  margin-left: 0.5rem;
`
const ButtonElem = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 8px;
  border-radius: 8px;
  /* background-color: ${p => (p.active ? p.theme.colorPrimary : p.theme.colorGreyDark2)}; */
  background-image: linear-gradient(
    to bottom right,
    ${p => p.theme.colorPrimary},
    ${p => p.theme.colorGreyLight3}
  );
  filter: grayscale(${p => (p.active ? '0%' : '90%')});
`
const Title = styled.span`
  margin: 4px;
  font-size: 12px;
`
const bounce = p => keyframes`
  80% { transform: translateY(0px) scale(1); background-color: red;}
  90% { transform: translateY(-20px) scale(2); background-color: ${p.theme.colorPrimary};}
  100% {transform: translateY(0px) scale(1); background-color: red;}
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
  animation: ${bounce} 5s infinite;
`

export default function ToggleButton(props) {
  const { children, title, importantTitle, iconClass, onClick, notification, active, 'data-cy': dataCy } = props

  const { innerWidth } = useWindowSize()

  const showTitle = title && (innerWidth > 480 || (importantTitle && innerWidth > 320))
  return (
    <StyledToggleButton data-cy={dataCy}>
      <ButtonElem flex active={active} onClick={onClick}>
        {showTitle && <Title>{title}</Title>}
        {children}
        {!children && iconClass && <i className={iconClass} />}
      </ButtonElem>
      {notification > 0 && <Notification>{notification}</Notification>}
    </StyledToggleButton>
  )
}
