import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import HtmlParse from '../helpers/htmlParse'
import VideoGrid from './VideoGrid'

const StyledVideoPlayer = styled.div`
  position: absolute;
  min-height: 20rem;
  width: 90%;
  display: flex;
  flex-direction: column;
  border: 2px solid #555;
  border-radius: .5rem;
  background-color: #111;
  transition: all .4s;
  /* opacity: ${props => (props.active ? 1 : 0)}; */

  & > p {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
  }

  & > iframe {
    align-self: center;
  }
`
const DragHandle = styled.div`
  position: absolute;
  bottom: -1.8rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  padding: 0.2rem 1rem;
  border-radius: 0 0 1rem 1rem;
  font-size: 1rem;
  background-image: linear-gradient(
    to bottom,
    ${props => props.theme.colorGreyLight1},
    ${props => props.theme.colorGreyDark2}
  );
`

/** ******************* Component Starts */
const VideoPlayer = props => {
  const [currentVideo, setCurrentVideo] = useState(null)
  const player = useRef()
  const parser = useRef(new HtmlParse(null))

  const coords = { x: window.innerWidth / 2, y: window.innerHeight / 3 }

  useEffect(() => {
    ;(async () => {
      // const parser = new HtmlParse(null)
      // const doc = await parser.parsePage()
      // console.log(doc)
    })()
  }, [])

  useEffect(() => {
    if (!player.current) return
    const iframe = document.querySelector('iframe').documentElement
    console.log(iframe)
    // console.log(player.current.shadowRoot)
    // const playPause = document.querySelector('[class*="playPause"]')
    // console.log(playPause)
    // return () => {
    //   effect
    // };
  })

  const onSubmit = async (e, newQuery) => {
    e.preventDefault()
    if (!newQuery) return
    parser.current = new HtmlParse(newQuery)
    await parser.current.parsePage()
    setCurrentVideo(parser.current.getVideoIdAt(0))
  }

  return (
    <React.Fragment>
      <VideoGrid videos={parser.current.videos} onSubmit={onSubmit} />
      <StyledVideoPlayer {...props} coords={coords}>
        <DragHandle {...props}>
          <i className="fas fa-grip-horizontal" />
        </DragHandle>
        {currentVideo ? (
          <iframe
            ref={player}
            title="PIP Video Player"
            src={HtmlParse.getUrl() + currentVideo}
            frameBorder="0"
            width={window.innerWidth * 0.9 - 10}
            height={window.innerWidth * 0.9 * 0.6}
            scrolling="no"
            allowFullScreen
          />
        ) : (
          <p>Watch something while you wait!</p>
        )}
      </StyledVideoPlayer>
    </React.Fragment>
  )
}

export default VideoPlayer
