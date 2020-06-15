import React from 'react'
import HtmlParse from '../helpers/htmlParse3'

const VideoPlayerContext = React.createContext({
  videoTime: 0,
})

export function useVideoPlayer() {
  return React.useContext(VideoPlayerContext)
}

export function VideoPlayerProvider(props) {
  const { children } = props
  const savedTime = React.useRef(0)
  const savedUrl = React.useRef('')
  const savedId = React.useRef(null)
  const savedPausedState = React.useRef(true)
  const [parser, setParser] = React.useState(new HtmlParse(''))

  const setVideoData = data => {
    savedTime.current = data.savedTime
    savedUrl.current = data.savedUrl
    savedId.current = data.savedId
  }

  // When user presses search
  const performNewSearch = async newQuery => {
    if (!newQuery || newQuery === parser.search) return
    const newParser = new HtmlParse(newQuery)
    await newParser.parsePage()
    setParser(newParser)
  }

  return (
    <VideoPlayerContext.Provider
      value={{
        savedPausedState: savedPausedState.current,
        savedTime: savedTime.current,
        savedId: savedId.current,
        savedUrl: savedUrl.current,
        setVideoData,
        parser,
        performNewSearch,
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  )
}
