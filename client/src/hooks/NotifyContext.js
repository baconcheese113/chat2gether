import React from 'react'

const NotifyContext = React.createContext()
export function useNotify() {
  return React.useContext(NotifyContext)
}

export const NotifyProvider = props => {
  const { children } = props
  const [countdownNotify, setCountdownNotify] = React.useState(false)
  const [videoNotify, setVideoNotify] = React.useState(false)
  const [textNotify, setTextNotify] = React.useState(0)
  console.log('NotifyProvider render')

  return (
    <NotifyContext.Provider
      value={{
        countdownNotify,
        videoNotify,
        setCountdownNotify,
        setVideoNotify,
        setTextNotify,
        textNotify,
      }}
    >
      {children}
    </NotifyContext.Provider>
  )
}
