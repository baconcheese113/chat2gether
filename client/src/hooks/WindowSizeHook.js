import React from 'react'

export default function useWindowSize() {
  const [windowSize, setWindowSize] = React.useState({ innerWidth: window.innerWidth, innerHeight: window.innerHeight })
  const { innerHeight, innerWidth } = windowSize

  const isPC = React.useMemo(() => innerWidth > 600, [innerWidth])
  const flowDirection = React.useMemo(() => (innerWidth > innerHeight ? 'row' : 'column'), [innerHeight, innerWidth])

  const updateSize = React.useCallback(() => {
    if (innerWidth === window.innerWidth && innerHeight === window.innerHeight) return
    console.log(`orientation change ${window.innerWidth} x ${window.innerHeight} now`)
    setWindowSize({ innerWidth: window.innerWidth, innerHeight: window.innerHeight })
  }, [innerHeight, innerWidth])

  React.useLayoutEffect(() => {
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [updateSize])

  return { innerHeight, innerWidth, isPC, flowDirection }
}
