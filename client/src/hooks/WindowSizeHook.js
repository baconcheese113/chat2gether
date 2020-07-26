import React from 'react'

export default function useWindowSize() {
  const [innerHeight, setInnerHeight] = React.useState(window.innerHeight)
  const [innerWidth, setInnerWidth] = React.useState(window.innerWidth)

  const isPC = React.useMemo(() => innerWidth > 600, [innerWidth])
  const flowDirection = React.useMemo(() => (innerWidth > innerHeight ? 'row' : 'column'), [innerHeight, innerWidth])

  const updateSize = React.useCallback(() => {
    setInnerHeight(window.innerHeight)
    setInnerWidth(window.innerWidth)
  }, [])

  React.useEffect(() => {
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { innerHeight, innerWidth, isPC, flowDirection }
}
