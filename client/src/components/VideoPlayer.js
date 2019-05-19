import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import HtmlParse from '../helpers/htmlParse'

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

const SearchBarForm = styled.form`
  display: flex;
  padding: 0;
  border: none;
  border-bottom: 1px solid #555;
`

const SearchBar = styled.input`
  display: block;
  background-color: #aaa;
  border-radius: 1rem;
  /* border: none; */
  width: 82%;
  margin: 0;
  margin-right: -5px;
  font-size: 1.6rem;
  padding: 0 4px;
  z-index: 5;
`
const SubmitButton = styled.button`
  display: block;
  padding: 3px 6px;
  text-align: center;
  font-size: 1.8rem;
  width: 20%;
  background-color: #222;
  z-index: 0;
`
/** ******************* Component Starts */
const VideoPlayer = props => {
  const [currentVideo, setCurrentVideo] = useState(null)
  const [query, setQuery] = useState('')

  const coords = { x: window.innerWidth / 2, y: window.innerHeight / 3 }

  useEffect(() => {
    ;(async () => {
      const parser = new HtmlParse(null)
      const doc = await parser.parsePage()
      console.log(doc)
    })()
  }, [])

  const onSubmit = async e => {
    e.preventDefault()
    if (!query) return
    const newParser = new HtmlParse(query)
    await newParser.parsePage()
    setCurrentVideo(newParser.getVideoIdAt(0))
  }

  return (
    <StyledVideoPlayer {...props} coords={coords}>
      <DragHandle {...props}>
        <i className="fas fa-grip-horizontal" />
      </DragHandle>
      <SearchBarForm onSubmit={onSubmit}>
        <SearchBar onChange={e => setQuery(e.target.value)} />
        <SubmitButton>Search</SubmitButton>
      </SearchBarForm>
      {currentVideo ? (
        <iframe
          title="PIP Video Player"
          src={`https://www.youtube.com/embed/${currentVideo}`}
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
  )
}

export default VideoPlayer
