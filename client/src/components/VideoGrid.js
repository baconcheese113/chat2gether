import React, { useState } from 'react'
import styled from 'styled-components'
import SVGTester from './SVGTester'

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
const SearchContent = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
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
const ResultImage = styled.img`
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
  const [isLoading, setIsLoading] = useState(false)

  const handleClose = () => {
    setIsShown(false)
  }

  const handleSelectVideo = id => {
    selectVideo(id)
    setIsShown(false)
  }

  const handleSearchSubmit = async e => {
    e.preventDefault()
    if (query.length < 1 || query === submittedQuery) return
    setSubmittedQuery(query)
    setIsLoading(true)
    try {
      await onSubmitSearch(query)
    } catch (err) {
      console.error(err)
    }
    setIsLoading(false)
  }

  const getContent = () => {
    if (isLoading) {
      console.log('displayed')
      const length = `${window.innerWidth / 3}px`
      return (
        <SearchContent>
          <SVGTester height={length} width={length} />
        </SearchContent>
      )
    }
    if (!videos.length && submittedQuery) {
      return (
        <SearchContent>
          <p>No results found</p>
        </SearchContent>
      )
    }
    if (videos.length) {
      return (
        <ScrollList>
          {videos.map(video => {
            return (
              <Result key={video.id} onClick={() => handleSelectVideo(video.id)}>
                <ResultTitle>{video.title}</ResultTitle>
                <ResultImage src={video.img} alt={video.title} />
                <ResultDuration>{video.duration}</ResultDuration>
              </Result>
            )
          })}
        </ScrollList>
      )
    }
    return (
      <SearchContent>
        <p>Enter a search above to start!</p>
      </SearchContent>
    )
  }

  return (
    <StyledVideoGrid isShown={isShown}>
      <Backdrop onClick={handleClose} />
      <CloseButton onClick={handleClose}>X</CloseButton>
      <Modal>
        <SearchBarForm onSubmit={handleSearchSubmit}>
          <SearchBar
            placeholder={`Search ${process.env.REACT_APP_SEARCH_DOMAIN} by keyword, URLs are not supported`}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <SubmitButton>Search</SubmitButton>
        </SearchBarForm>
        {getContent()}
      </Modal>
    </StyledVideoGrid>
  )
}

export default VideoGrid
