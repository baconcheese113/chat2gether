import React from 'react'
import styled from 'styled-components'
import SVGTester from './SVGTester'
import { Button } from './common'

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
const CloseButton = styled(Button)`
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
  background-color: #313131;
  border-radius: 5px;

  display: flex;
  padding: 0;
  border: none;
  border-bottom: 1px solid #555;
`

const SearchBar = styled.input`
  outline: none;
  border: 2px solid #3f3f3f;
  cursor: pointer;

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
const SubmitButton = styled(Button)`
  display: block;
  padding: 3px 6px;
  width: 20%;
  background-color: #222;
`

export default function VideoGrid(props) {
  const { videos, onSubmitSearch, isShown, setIsShown, selectVideo } = props
  const [query, setQuery] = React.useState('')
  const [submittedQuery, setSubmittedQuery] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleClose = () => {
    setIsShown(false)
  }

  const handleSelectVideo = id => {
    selectVideo(id)
    setIsShown(false)
  }

  const handleSearchSubmit = async e => {
    e && e.preventDefault()
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
              <Result data-cy="playerSearchResult" key={video.id} onClick={() => handleSelectVideo(video.id)}>
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
      <CloseButton onClick={handleClose} label="X" />
      <Modal>
        <SearchBarForm onSubmit={handleSearchSubmit}>
          <SearchBar
            data-cy="playerSearchInput"
            placeholder={`Search ${process.env.REACT_APP_SEARCH_DOMAIN} by keyword, URLs are not supported`}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <SubmitButton data-cy="playerSearchSubmit" onClick={handleSearchSubmit} label="Search" />
        </SearchBarForm>
        {getContent()}
      </Modal>
    </StyledVideoGrid>
  )
}
