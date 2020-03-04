import React from 'react'
import styled from 'styled-components'

const StyledToggleButton = styled.div`
  position: relative;
  height: 3.5rem;
  width: 3.5rem;
  color: ${props => props.theme.colorPrimaryLight};
  margin-left: '.5rem';
`
const ButtonElem = styled.button`
  height: 100%;
  width: 100%;
  padding: 0;
  border-radius: 50%;
  /* background-color: ${({ active, theme }) => (active ? theme.colorPrimary : theme.colorGreyDark2)}; */
  background-image: linear-gradient(
    to bottom right,
    ${({ theme }) => theme.colorPrimary},
    ${({ theme }) => theme.colorGreyLight3}
  );
  z-index: inherit;
  filter: grayscale(${props => (props.active ? '0%' : '90%')});
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

const ToggleButton = props => {
  const { title, iconClass, onClick, notification, active, dataCy } = props
  return (
    <>
      <StyledToggleButton data-cy={dataCy}>
        <ButtonElem onClick={onClick} active={active}>
          {title}
          {iconClass && <i className={iconClass} />}
        </ButtonElem>
        {notification > 0 && <Notification>{notification}</Notification>}
      </StyledToggleButton>
    </>
  )
}

export default ToggleButton
