import React, { useState } from 'react'
import styled from 'styled-components'

const StyledVideoGrid = styled.div`
  position: absolute;
  /* top: 0;
  bottom: 0;
  left: 0;
  right: 0; */
  width: 100%;
  height: 100%;
  z-index: 100;
`
const Backdrop = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
`
const Modal = styled.div`
  position: absolute;
  top: 10%;
  bottom: 10%;
  left: 5%;
  right: 5%;
  background-color: rgba(0, 0, 0, 0.8);
`
const ScrollList = styled.div`
  /* position: absolute; */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 1rem;
  height: 40vh;
  /* grid-auto-rows: 10rem; */
  overflow-y: auto;
`
const Result = styled.figure`
  height: 100%;
  overflow: hidden;
  position: relative;
  min-height: 15rem;
  background-color: red;
`
const ResultTitle = styled.figcaption`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-size: 1.6rem;
  background-color: rgba(0, 0, 0, 0.2);
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

const VideoGrid = props => {
  const { videos, onSubmit } = props
  const [query, setQuery] = useState('')

  return (
    <StyledVideoGrid>
      <Backdrop />
      <Modal>
        <SearchBarForm onSubmit={e => onSubmit(e, query)}>
          <SearchBar value={query} onChange={e => setQuery(e.target.value)} />
          <SubmitButton>Search</SubmitButton>
        </SearchBarForm>
        <ScrollList>
          {videos &&
            videos.map(video => {
              return (
                <Result>
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
