import React from 'react'
import styled from 'styled-components'

const StyledToggleButton = styled.div`
  position: relative;
  height: 4.5rem;
  margin: 2px 0.5rem;
  min-width: 4.5rem;
  color: ${props => props.theme.colorPrimaryLight};

  margin-left: ${props => (props.right ? 'auto' : '.5rem')};
`
const ButtonElem = styled.button`
  height: 100%;
  width: 100%;
  border-radius: 50%;
  /* background-color: ${({ active, theme }) => (active ? theme.colorPrimary : theme.colorGreyDark2)}; */
  background-image: linear-gradient(
    to bottom right,
    ${({ theme }) => theme.colorPrimary},
    ${({ theme }) => theme.colorGreyLight3}
  );
  
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
  z-index: 10;
`

const ToggleButton = props => {
  const { title, iconClass, onClick, notification } = props
  return (
    <React.Fragment>
      <StyledToggleButton {...props}>
        <ButtonElem onClick={onClick} {...props}>
          {title}
          {iconClass ? <i className={iconClass} /> : ''}
        </ButtonElem>
        {notification > 0 ? <Notification>{notification}</Notification> : ''}
      </StyledToggleButton>
    </React.Fragment>
  )
}

export default ToggleButton
