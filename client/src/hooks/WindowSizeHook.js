import React from 'react'

export default function useWindowSize() {
  const [windowSize, setWindowSize] = React.useState({ innerWidth: window.innerWidth, innerHeight: window.innerHeight })
  const { innerHeight, innerWidth } = windowSize

  const isPC = React.useMemo(() => innerWidth > 600, [innerWidth])
  const flowDirection = React.useMemo(() => (innerWidth > innerHeight ? 'row' : 'column'), [innerHeight, innerWidth])

  const updateSize = React.useCallback(() => {
    if (innerHeight === window.innerHeight && innerWidth === window.innerWidth) return
    setWindowSize({ innerWidth: window.innerWidth, innerHeight: window.innerHeight })
  }, [innerHeight, innerWidth])

  React.useEffect(() => {
    window.addEventListener('resize', updateSize)
    window.addEventListener('orientationchange', updateSize)
    return () => {
      window.removeEventListener('resize', updateSize)
      window.removeEventListener('orientationchange', updateSize)
    }
  }, [updateSize])

  return { innerHeight, innerWidth, isPC, flowDirection }
}
