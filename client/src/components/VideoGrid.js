import React, { useState } from 'react'
import styled from 'styled-components'

const StyledVideoGrid = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: ${props => (props.isShown ? 'block' : 'none')};
`
const Backdrop = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
`
const Modal = styled.div`
  position: absolute;
  top: 10%;
  bottom: 10%;
  left: 5%;
  right: 5%;
  background-color: rgba(0, 0, 0, 0.8);
  overflow-y: hidden;
  max-width: 90rem;
  margin: 0 auto;
  border-radius: 0 0 2rem 2rem;
`
const CloseButton = styled.button`
  position: absolute;
  top: 5%;
  right: 5%;
`
const ScrollList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 1rem;
  height: 93%;
  overflow-y: auto;
`
const Result = styled.figure`
  height: 100%;
  overflow: hidden;
  position: relative;
  min-height: 15rem;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }
`
const ResultTitle = styled.figcaption`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-size: 1.6rem;
  background-color: rgba(0, 0, 0, 0.4);
`
const ResultImage = styled.iframe`
  height: 100%;
`
const ResultDuration = styled.span`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
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

const VideoGrid = props => {
  const { videos, onSubmitSearch, isShown, setIsShown, selectVideo } = props
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')

  const handleClose = e => {
    setIsShown(false)
  }

  const handleSelectVideo = id => {
    selectVideo(id)
    setIsShown(false)
  }

  const handleSearchSubmit = e => {
    e.preventDefault()
    if (query.length < 1 || query === submittedQuery) return
    onSubmitSearch(query)
    setSubmittedQuery(query)
  }

  console.log(videos.reduce((prev, cur) => [...prev, cur.img], []))

  return (
    <StyledVideoGrid isShown={isShown}>
      <Backdrop onClick={handleClose} />
      <CloseButton onClick={handleClose}>X</CloseButton>
      <Modal>
        <SearchBarForm onSubmit={handleSearchSubmit}>
          <SearchBar value={query} onChange={e => setQuery(e.target.value)} />
          <SubmitButton>Search</SubmitButton>
        </SearchBarForm>
        <ScrollList>
          {videos &&
            videos.map(video => {
              return (
                <Result key={video.id} onClick={() => handleSelectVideo(video.id)}>
                  <ResultTitle>{video.title}</ResultTitle>
                  <ResultImage src={video.img} alt={video.title} />
                  <ResultDuration>{video.duration}</ResultDuration>
                </Result>
              )
            })}
        </ScrollList>
      </Modal>
    </StyledVideoGrid>
  )
}

export default VideoGrid
