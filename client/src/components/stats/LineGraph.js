import React from 'react'
import styled, { keyframes } from 'styled-components'
import { useApolloClient } from '@apollo/client'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import { GET_USERS } from '../../queries/queries'
import { GENDERS, GENDER_COLORS, GENDER_DASHARRAY } from '../../helpers/constants'
import StatsWindow from './StatsWindow'

const containerXY = { x: 500, y: 500 }
const numIntervals = 6
const numIntervalsY = 4
const vb = { x: 500, y: 500 }
const graph = { x: vb.x * (3 / 5), y: vb.y * (3 / 5) }
const gStart = { x: vb.x / 5, y: vb.y / 5 }
const gEnd = { x: vb.x * (4 / 5), y: vb.y * (4 / 5) }
const intSpace = { x: graph.x / (numIntervals - 1), y: graph.y / numIntervalsY }
const titleSize = `${vb.y * 0.005}rem`
const intervalSize = `${vb.y * 0.003}rem`
const legendSize = `${vb.y * 0.002}rem`

const pixelToPercent = (x, y) => {
  const bottomDif = vb.y - gEnd.y
  const xPercent = (x / vb.x) * 100
  const yPercent = 100 - ((y + bottomDif) / vb.y) * 100
  return { xPercent, yPercent }
}

const StyledLineGraph = styled.div`
  width: ${containerXY.x}px;
  max-width: 95%;
  margin: 0 auto;
  position: relative;
  box-shadow: 0 0 1rem #000;
  border-radius: 1rem;
  background-color: #1b2b38;
`
const SVGContainer = styled.svg`
  max-width: 500px;
  width: 100%;

  .graph-axis {
    stroke: black;
    fill: none;
  }
`
const drawLine = dashArray => keyframes`
  0% {stroke-dashoffset: 421px;}
  50% {stroke-dasharray: 20 20;}
  100% {
    stroke-dashoffset: 0px;
    stroke-dasharray: ${dashArray};
  }
`
const fillShadowLine = keyframes`
  0% {stroke-opacity: 0;}
  100% {stroke-opacity: 0.3;}
`
const fillCircle = yPercent => keyframes`
  0% {transform: translateY(-${yPercent}%);}
  100% {transform: translateY(0);}
`
const LeadLine = styled.path`
  stroke-dasharray: 421px;
  animation: ${p => drawLine(p.dashArray)} 6s forwards;
`
const ShadowLine = styled.path`
  animation: ${fillShadowLine} 6s linear forwards;
`
const LineCircle = styled.circle`
  animation: ${p => fillCircle(p.timeSlot * 20 + 100)} ${p => p.wave / 2 / (p.timeSlot + 1) + 1}s linear forwards;
`

export default function LineGraph() {
  const [statsWindow, setStatsWindow] = React.useState(null)
  const [timeGroupings, setTimeGroupings] = React.useState(Array(numIntervals).fill({}))
  const [minuteSpread, setMinuteSpread] = React.useState(60 * 24 * 30)

  const intervalRange = minuteSpread / numIntervals // minutes

  const gradAnimateMale = React.useRef(null)
  const gradAnimateFemale = React.useRef(null)
  const gradAnimateM2F = React.useRef(null)
  const gradAnimateF2M = React.useRef(null)
  const maxLineHeight = React.useRef(10)

  const client = useApolloClient()

  const getTimeGroupings = React.useCallback(
    usersList => {
      const d = new Date()
      const initialTimeInts = Array(numIntervals + 1)
        .fill({})
        .map((val, index) => {
          return { start: new Date().setMinutes(d.getMinutes() - index * intervalRange), users: [] }
        })

      // arr[0][{start: 189418, users: []]
      const timeGroups = usersList.reduce((timeInts, user) => {
        // return arr[x]['genders'] with the user added to all
        return timeInts.map((timeInt, index) => {
          if (
            index < numIntervals &&
            Date.parse(user.updatedAt) > timeInts[index + 1].start &&
            Date.parse(user.createdAt) < timeInt.start
          ) {
            return { ...timeInt, users: [...timeInt.users, user] }
          }
          return timeInt
        })
      }, initialTimeInts)
      timeGroups.forEach(v => {
        const l = v.users.length
        if (l > maxLineHeight.current) maxLineHeight.current = l
      })
      setTimeGroupings(timeGroups.slice(0, -1))
    },
    [intervalRange],
  )

  const refreshUserCount = React.useCallback(async () => {
    maxLineHeight.current = 10
    const d = new Date()
    d.setMinutes(d.getMinutes() - intervalRange * (numIntervals + 1))
    const where = { where: { updatedAt_gt: d.toISOString() } }
    const { loading, err, data } = await client.query({ query: GET_USERS, variables: where })
    if (loading) console.log('loading ', loading)
    if (err) {
      console.error(err)
    }
    if (!gradAnimateMale.current || !gradAnimateFemale.current || !gradAnimateF2M.current || !gradAnimateM2F.current)
      return
    gradAnimateMale.current.beginElement()
    gradAnimateFemale.current.beginElement()
    gradAnimateF2M.current.beginElement()
    gradAnimateM2F.current.beginElement()
    getTimeGroupings(data.users)
  }, [client, getTimeGroupings, intervalRange])

  React.useEffect(() => {
    refreshUserCount()
  }, [minuteSpread, refreshUserCount])

  const makeStatsObj = timeSlot => {
    const timeUsers = timeGroupings[timeGroupings.length - timeSlot - 1].users
    const genderObj = timeUsers.reduce((prev, cur) => {
      return { ...prev, [cur.gender]: (prev[cur.gender] || 0) + 1 }
    }, {})
    const timeSlotSpread = timeSlot * intSpace.x
    const statsObjGenders = GENDERS.map(v => {
      return { title: v, text: genderObj[v] || '0', color: GENDER_COLORS[v] }
    })
    const tallestBar = GENDERS.reduce((prev, cur) => (prev > (genderObj[cur] || 0) ? prev : genderObj[cur]), 1)
    const yLoc = gEnd.y - graph.y * (tallestBar / maxLineHeight.current)
    const { xPercent: center, yPercent: bottom } = pixelToPercent(gStart.x + timeSlotSpread, yLoc)
    return { center, bottom, values: statsObjGenders }
  }

  const makeSelectRect = timeSlot => {
    if (!timeGroupings || !timeGroupings[0].users) return ''
    const timeUsers = timeGroupings[timeGroupings.length - timeSlot - 1].users
    const genderObj = timeUsers.reduce((prev, cur) => {
      return { ...prev, [cur.gender]: (prev[cur.gender] || 0) + 1 }
    }, {})
    const timeSlotSpread = timeSlot * intSpace.x
    const tallestBar = GENDERS.reduce((prev, cur) => (prev > (genderObj[cur] || 0) ? prev : genderObj[cur]), 1)
    const selectHeight = Math.max(graph.y * (tallestBar / maxLineHeight.current), 20)
    const statsObj = makeStatsObj(timeSlot)
    return (
      <rect
        key={timeSlot}
        onMouseOver={() => setStatsWindow(statsObj)}
        onMouseOut={() => setStatsWindow(null)}
        onFocus={() => setStatsWindow(statsObj)}
        onBlur={() => setStatsWindow(null)}
        height={selectHeight}
        width={intSpace.x}
        y={gEnd.y - selectHeight}
        x={gStart.x + timeSlotSpread - intSpace.x / 2}
        opacity="0"
        rx="5"
        ry="5"
      />
    )
  }

  const buildLine = gender => {
    if (!timeGroupings || !timeGroupings[0].users) return ''

    const genderArr = timeGroupings.reduce((prev, cur) => {
      return [...prev, cur.users.filter(v => v.gender === gender)]
    }, [])
    const computedLines = genderArr
      .slice()
      .reverse()
      .reduce(
        (prev, cur, idx) => {
          const yLoc = gEnd.y - Math.max(graph.y * (cur.length / maxLineHeight.current), 5)
          const xLoc = idx * intSpace.x + gStart.x
          const halfLoc = xLoc - intSpace.x / 2
          const offset = 10
          // prettier-ignore
          const leadLine = `${prev.leadLine}${idx === 0 ? `M ${gStart.x} ${yLoc} ` : ''}S ${halfLoc} ${yLoc}, ${xLoc} ${yLoc} `
          // prettier-ignore
          const shadowLine = `${prev.shadowLine}${idx === 0 ? `M ${gStart.x} ${yLoc + offset} ` : ''}S ${halfLoc} ${yLoc + offset}, ${xLoc} ${yLoc + offset} `
          const circles = [
            ...prev.circles,
            <LineCircle
              key={`circle${gender}${idx}${minuteSpread}`}
              cx={xLoc}
              cy={yLoc}
              timeSlot={idx}
              wave={GENDERS.findIndex(v => v === gender) + 1}
              r="5"
              fill={GENDER_COLORS[gender]}
            />,
          ]
          return { leadLine, shadowLine, circles }
        },
        { leadLine: '', shadowLine: '', circles: [] },
      )
    const { leadLine, shadowLine, circles } = computedLines
    return (
      <g key={`line${gender}${minuteSpread}`}>
        <LeadLine
          d={`${leadLine} V ${vb.y} H 0`}
          stroke={GENDER_COLORS[gender]}
          strokeLinecap="round"
          strokeWidth="3"
          dashArray={GENDER_DASHARRAY[gender]}
          fill={`url(#grad${gender})`}
        />
        <ShadowLine
          d={`${shadowLine}`}
          stroke={`url(#grad${gender})`}
          strokeLinecap="round"
          strokeWidth="15"
          fill="none"
        />
        {circles}
      </g>
    )
  }

  const getMinuteDivisor = () => {
    if (minuteSpread < 60 * 3) return 1
    if (minuteSpread < 60 * 24 * 3) return 60
    if (minuteSpread < 60 * 24 * 96) return 60 * 24
    return 60 * 24 * 30
  }

  const printAxis = () => {
    const xVals = Array(numIntervals)
      .fill(0)
      .map((_val, idx) => {
        const timeAgo = (intervalRange / getMinuteDivisor()) * (numIntervals - idx - 1)
        const roundedTimeAgo = Math.round((timeAgo * 100) / 100)
        return (
          <text
            x={gStart.x + intSpace.x * idx}
            y={gEnd.y + vb.y * 0.02}
            key={idx}
            fill="#ccc"
            textAnchor="middle"
            fontSize={intervalSize}
            alignmentBaseline="central"
          >
            {roundedTimeAgo || 'Now'}
          </text>
        )
      })
    return (
      <g>
        {xVals}
        <text x={gEnd.x + 20} y={gStart.y + intSpace.y} fill="#ccc" fontSize={intervalSize} alignmentBaseline="central">
          {Math.round((maxLineHeight.current * 3) / 4)} Users
        </text>
        <text
          x={gEnd.x + 20}
          y={gStart.y + intSpace.y * ((numIntervalsY * 3) / 4)}
          fill="#ccc"
          fontSize={intervalSize}
          alignmentBaseline="central"
        >
          {Math.round(maxLineHeight.current / 4)} Users
        </text>
      </g>
    )
  }

  React.useEffect(() => {
    refreshUserCount()
  }, [refreshUserCount])

  const printGrid = () => {
    return Array(numIntervalsY)
      .fill(0)
      .map((_, idx) => (
        <rect
          key={idx}
          x={gStart.x}
          width={graph.x}
          y={gEnd.y - idx * intSpace.y}
          height="1"
          fill="white"
          opacity=".1"
        />
      ))
  }

  const printLegend = () => {
    return (
      <g>
        {GENDERS.slice()
          .reverse()
          .map((g, idx) => {
            return (
              <g key={g}>
                <rect
                  rx="2"
                  ry="5"
                  x={(vb.x / 4) * idx + 20}
                  y={vb.y * 0.9}
                  width="20"
                  height="5"
                  fill={GENDER_COLORS[g]}
                />
                <text
                  x={(vb.x / 4) * idx + 50}
                  y={vb.y * 0.9 + 0.005 * vb.x}
                  fill="#ccc"
                  fontSize={legendSize}
                  alignmentBaseline="central"
                >
                  {g}
                </text>
              </g>
            )
          })}
      </g>
    )
  }

  const getTitle = () => {
    if (minuteSpread < 60 * 3) return 'Users by Minutes ago'
    if (minuteSpread < 60 * 24 * 3) return 'Users by Hours ago'
    if (minuteSpread < 60 * 24 * 96) return 'Users by Days ago'
    return 'Users by Months ago'
  }

  const handleMinuteSpreadChange = e => {
    e.preventDefault()
    setMinuteSpread(e.target.value)
  }

  return (
    <StyledLineGraph>
      <SVGContainer
        width="100%"
        style={{ height: 'auto' }}
        viewBox={`0 0 ${vb.x} ${vb.y}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gradMALE" x2="0" y2="100%">
            <stop offset="0%" stopColor={GENDER_COLORS.MALE} stopOpacity=".4">
              <animate ref={gradAnimateMale} attributeName="stop-opacity" values="0; 0; .4" dur="6s" repeatCount="1" />
            </stop>
            <stop offset="100%" stopColor={GENDER_COLORS.MALE} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradFEMALE" x2="0" y2="100%">
            <stop offset="0%" stopColor={GENDER_COLORS.FEMALE} stopOpacity=".4">
              <animate
                ref={gradAnimateFemale}
                attributeName="stop-opacity"
                values="0; 0; .4"
                dur="6s"
                repeatCount="1"
              />
            </stop>
            <stop offset="100%" stopColor={GENDER_COLORS.FEMALE} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradM2F" x2="0" y2="100%">
            <stop offset="0%" stopColor={GENDER_COLORS.M2F} stopOpacity=".4">
              <animate ref={gradAnimateM2F} attributeName="stop-opacity" values="0; 0; .4" dur="6s" repeatCount="1" />
            </stop>
            <stop offset="100%" stopColor={GENDER_COLORS.M2F} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradF2M" x2="0" y2="100%">
            <stop offset="0%" stopColor={GENDER_COLORS.F2M} stopOpacity=".4">
              <animate ref={gradAnimateF2M} attributeName="stop-opacity" values="0; 0; .4" dur="6s" repeatCount="1" />
            </stop>
            <stop offset="100%" stopColor={GENDER_COLORS.F2M} stopOpacity="0" />
          </linearGradient>

          <mask id="mask">
            <rect width={graph.x} height={graph.y} x={gStart.x} y={gStart.y} fill="white" />
          </mask>
        </defs>
        <path d={`M${gStart.x} ${gEnd.y} H ${gEnd.x} V ${gStart.y}`} className="graph-axis" />
        <text x={vb.x * 0.1} y={vb.y * 0.1} fill="#ccc" textAnchor="left" fontSize={titleSize}>
          {getTitle()}
        </text>
        <g>{printGrid()}</g>
        {printAxis()}
        {printLegend()}
        <g mask="url(#mask)">{timeGroupings && GENDERS.map(gender => buildLine(gender))}</g>
        {timeGroupings && timeGroupings.map((_v, idx) => makeSelectRect(idx))}
      </SVGContainer>
      <FormControl
        style={{
          position: 'absolute',
          right: '10%',
          top: '5%',
          backgroundColor: '#3c4e59',
          borderRadius: '50rem',
          padding: '0 1rem',
        }}
      >
        <Select
          value={minuteSpread}
          data-cy="timeSelect"
          onChange={handleMinuteSpreadChange}
          style={{ color: 'white' }}
        >
          <MenuItem value={60}>1 Hour</MenuItem>
          <MenuItem value={60 * 6}>6 Hours</MenuItem>
          <MenuItem value={60 * 24}>1 Day</MenuItem>
          <MenuItem value={60 * 24 * 6}>6 Days</MenuItem>
          <MenuItem value={60 * 24 * 30}>1 Month</MenuItem>
        </Select>
      </FormControl>

      {statsWindow && (
        <StatsWindow bottom={statsWindow.bottom} center={statsWindow.center} values={statsWindow.values} />
      )}
    </StyledLineGraph>
  )
}
