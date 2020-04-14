import React from 'react'
import styled from 'styled-components'
import Button from './Button'

const StyledDialog = styled.div`
  display: ${p => (p.open ? 'flex' : 'none')};
  position: absolute;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  z-index: 100;
`
const Blur = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  filter: blur(5px) saturate(20%);
  background-color: rgba(0, 0, 0, 0.5);
`
const Container = styled.div`
  position: relative;
  width: 500px;
  max-width: 95%;
  max-height: 80%;
  background-color: ${p => p.theme.colorGreyDark2};
  border-radius: 5px;
  box-shadow: 0 0 10px #000;
  display: flex;
  flex-direction: column;
`
const Title = styled.h3`
  margin: 10px 16px;
  margin-bottom: 16px;
  font-size: 2rem;
  padding: 1rem;
  border-bottom: 2px solid #222;
`
const Content = styled.div`
  display: flex;
  padding: 1rem 2rem;
  flex-direction: column;
  max-height: 20%;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 16px;
`
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`
const ConfirmButton = styled(Button)`
  margin-left: 8px;
`
const CancelButton = styled(Button)``

export default function Dialog(props) {
  const { children, confirmText, disabled, isLoading, onCancel, onConfirm, open, title } = props

  return (
    <StyledDialog open={open}>
      <Blur role="button" tabIndex={0} onClick={onCancel} onKeyUp={onCancel} />
      <Container>
        {title && <Title>{title}</Title>}
        <Content>{children}</Content>
        <Actions>
          <CancelButton flex square label="Cancel" onClick={onCancel} />
          <ConfirmButton
            flex
            primary
            square
            disabled={disabled || isLoading}
            label={isLoading ? 'Loading...' : confirmText}
            onClick={onConfirm}
          />
        </Actions>
      </Container>
    </StyledDialog>
  )
}

Dialog.defaultProps = {
  title: 'Alert',
  confirmText: 'Apply',
  onCancel: () => {},
  onConfirm: () => {},
}
