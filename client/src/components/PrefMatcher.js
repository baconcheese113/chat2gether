import React from 'react'
import styled from 'styled-components'
import { AUDIO_PREFS } from '../helpers/constants'

const StyledPrefMatcher = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: flex-start;
  align-items: center;
`
const Container = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
`
const MatcherTitle = styled.p`
  font-size: 16px;
`
const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px;
  transition: all 0.4s;
`
const ColumnTitle = styled.h3`
  font-size: 14px;
`
const ColumnSubtitle = styled.h4`
  font-size: 12px;
`
const Chip = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
  background-color: ${p => p.theme.colorPrimary};
  filter: ${p => p.grayedOut && 'grayscale(.9)'};
  width: 160px;
  max-width: calc((100vw - 8px) * 0.4);
  opacity: ${p => p.hiden && 0};
  border: ${p => (p.removed ? 0 : 3)}px dashed ${p => (p.selected ? '#eee' : 'transparent')};
  border-radius: 20px;
  padding: ${p => !p.removed && '4px 6px'};
  margin: ${p => !p.removed && '4px'};
  transition: 0.6s opacity, 0.4s border, 0.4s padding, 0.4s margin;
`
const ChipTitle = styled.span`
  font-size: 14px;
`
const DrawLine = styled.div`
  width: ${p => (p.extend ? 32 : 0)}px;
  opacity: ${p => (p.extend ? 1 : 0)};
  position: absolute;
  top: 50%;
  left: 100%;
  border: 2px dashed #eee;
  transition: 1s width, 0.5s opacity;
`

export default function PrefMatcher(props) {
  const { myPref, myAccPrefs, myAge, myGender, theirPref, theirAccPrefs, theirAge, theirGender } = props
  const [startExtend, setStartExtend] = React.useState(false)
  const [startHide, setStartHide] = React.useState(false)
  const [startRemove, setStartRemove] = React.useState(false)
  // Since prefs are sorted correctly, this should work
  const matchPref = AUDIO_PREFS.find(pref => pref === myPref || pref === theirPref)

  // Lets not discuss this
  React.useEffect(() => {
    const timeoutArr = []
    timeoutArr.push(
      setTimeout(() => {
        setStartExtend(true)
        timeoutArr.push(
          setTimeout(() => {
            setStartHide(true)
            timeoutArr.push(
              setTimeout(() => {
                setStartRemove(true)
              }, 1000),
            )
          }, 1000),
        )
      }, 1000),
    )
    return () => {
      timeoutArr.forEach(t => clearTimeout(t))
    }
  }, [])

  const getPrefs = (chosenPref, canExtend, accPrefs) => {
    console.log('accPrfs is ', accPrefs)
    return AUDIO_PREFS.map(pref => {
      const matchedPref = pref === matchPref
      return (
        <Chip
          key={pref}
          selected={pref === chosenPref}
          matched={matchedPref}
          hiden={!matchedPref && startHide}
          removed={!matchedPref && startRemove}
          grayedOut={!accPrefs.includes(pref)}
        >
          <ChipTitle>{pref.replace(/_/g, ' ')}</ChipTitle>
          {matchedPref && canExtend && <DrawLine extend={startExtend} />}
        </Chip>
      )
    })
  }

  return (
    <StyledPrefMatcher>
      <MatcherTitle>Audio Preference Decider</MatcherTitle>
      <Container>
        <Column>
          <ColumnTitle>Me</ColumnTitle>
          <ColumnSubtitle>
            {myAge} | {myGender}
          </ColumnSubtitle>
          {getPrefs(myPref, true, myAccPrefs)}
        </Column>
        <Column>
          <ColumnTitle>Them</ColumnTitle>
          <ColumnSubtitle>
            {theirAge} | {theirGender}
          </ColumnSubtitle>
          {getPrefs(theirPref, false, theirAccPrefs)}
        </Column>
      </Container>
    </StyledPrefMatcher>
  )
}
