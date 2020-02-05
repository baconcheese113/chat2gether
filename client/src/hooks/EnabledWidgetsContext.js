import React from 'react'

const EnabledWidgetsContext = React.createContext({
  enabledWidgets: {
    text: false,
    menu: false,
    video: false,
    countdown: false,
    profile: false,
    matches: false,
    stats: false,
    updatePref: false,
  },
  setEnabledWidgets: () => {},
  chatSettings: { micMute: false, speakerMute: false },
  setChatSettings: () => {},
  featureToggle: () => {},
})
export function useEnabledWidgets() {
  return React.useContext(EnabledWidgetsContext)
}

export const EnabledWidgetsProvider = props => {
  const { children } = props
  const [enabledWidgets, setEnabledWidgets] = React.useState({
    text: false,
    menu: false,
    video: false,
    countdown: false,
    profile: false,
    matches: false,
    stats: false,
    updatePref: false,
  })
  console.log('enabledWidgetsProvider render')

  const [chatSettings, setChatSettings] = React.useState({ micMute: false, speakerMute: false })

  // const changeWidgetsActive = newWidgets => {
  //   setEnabledWidgets(...enabledWidgets, ...newWidgets)
  // }
  const featureToggle = elem => {
    setEnabledWidgets({ [elem]: !enabledWidgets[elem] })
  }

  return (
    <EnabledWidgetsContext.Provider
      value={{ enabledWidgets, setEnabledWidgets, chatSettings, setChatSettings, featureToggle }}
    >
      {children}
    </EnabledWidgetsContext.Provider>
  )
}
