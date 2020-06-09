import React from 'react'

export default function useWindowSize() {
  const [windowSize, setWindowSize] = React.useState({ innerWidth: window.innerWidth, innerHeight: window.innerHeight })
  const { innerHeight, innerWidth } = windowSize

  const isPC = React.useMemo(() => innerWidth > 600, [innerWidth])
  const flowDirection = React.useMemo(() => (window.innerWidth > window.innerHeight ? 'row' : 'column'), [])

  const updateSize = React.useCallback(() => {
    console.log(`orientation change ${window.innerWidth} x ${window.innerHeight} now`)
    setWindowSize({ innerWidth: window.innerWidth, innerHeight: window.innerHeight })
  }, [])

  React.useEffect(() => {
    window.addEventListener('resize', updateSize)
    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [updateSize])

  return { innerHeight, innerWidth, isPC, flowDirection }
}
