import React from 'react'
import styled from 'styled-components'
import { useApolloClient } from '@apollo/react-hooks'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import { GET_USERS } from '../../queries/queries'
import { GENDERS, GENDER_COLORS } from '../../helpers/constants'
import StatsWindow from './StatsWindow'

const containerXY = { x: 500, y: 500 }
const numIntervals = 4
const numIntervalsY = 4
const barWidth = 12
const vb = { x: 500, y: 500 }
const graph = { x: vb.x * (3 / 5), y: vb.y * (3 / 5) }
const gStart = { x: vb.x / 5, y: vb.y / 5 }
const gEnd = { x: vb.x * (4 / 5), y: vb.y * (4 / 5) }
const intSpace = { x: (graph.x - 4 * barWidth) / (numIntervals - 1), y: graph.y / numIntervalsY }
const titleSize = `${vb.y * 0.005}rem`
const intervalSize = `${vb.y * 0.003}rem`
const legendSize = `${vb.y * 0.002}rem`

const pixelToPercent = (x, y) => {
  const bottomDif = vb.y - gEnd.y
  const xPercent = (x / vb.x) * 100
  const yPercent = 100 - ((y + bottomDif) / vb.y) * 100
  return { xPercent, yPercent }
}

const StyledBarGraph = styled.div`
  height: ${containerXY.y}px;
  width: ${containerXY.x}px;
  margin: 0 auto;
  position: relative;
  box-shadow: 0 0 1rem #000;
  border-radius: 1rem;
  background-color: #313131;
`

const SVGContainer = styled.svg`
  height: 100%;
  width: 100%;
  /* background-color: red; */
`
const Bar = styled.rect`
  stroke-linecap: round;
  transition: all 1s;
`

export default function BarGraph() {
  const [statsWindow, setStatsWindow] = React.useState(null)
  const [users, setUsers] = React.useState([])
  const [timeGroupings, setTimeGroupings] = React.useState(Array(numIntervals).fill({}))
  const [minuteSpread, setMinuteSpread] = React.useState(60 * 24)

  const intervalRange = minuteSpread / numIntervals // minutes

  const maxLineHeight = React.useRef(10)

  const client = useApolloClient()

  const refreshUserCount = async () => {
    maxLineHeight.current = 10
    const d = new Date()
    d.setMinutes(d.getMinutes() - intervalRange * (numIntervals + 1))
    const where = { where: { updatedAt_gt: d.toISOString() } }
    const { loading, err, data } = await client.query({ query: GET_USERS, variables: where })
    if (loading) console.log('loading ', loading)
    if (err) {
      console.error(err)
    }
    console.log(data)
    // setUsers({timestamp: new Date(), list: data.users})

    await setUsers(data.users)
    getTimeGroupings(data.users)
  }

  React.useEffect(() => {
    refreshUserCount()
  }, [minuteSpread])

  const getTimeGroupings = usersList => {
    console.log(usersList)
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
    console.log(timeGroups)
    setTimeGroupings(timeGroups)
  }

  // const showStatsFor = genderObj => {
  //   setStatsWindow(genderObj)
  // }

  const buildBars = timeSlot => {
    console.log('buildBars with ', timeGroupings)
    if (!timeGroupings) return <g key={`empty${timeSlot}`} />
    const timeUsers = timeGroupings[timeSlot].users
    if (!timeUsers) return <g key={`empty${timeSlot}`} />
    const genderObj = timeUsers.reduce((prev, cur) => {
      return { ...prev, [cur.gender]: (prev[cur.gender] || 0) + 1 }
    }, {})
    const timeSlotSpread = timeSlot * intSpace.x
    // Calculations for Stats window
    const statsObjGenders = GENDERS.map(v => {
      return { title: v, text: genderObj[v] || '0', color: GENDER_COLORS[v] }
    })
    const tallestBar = GENDERS.reduce((prev, cur) => (prev > (genderObj[cur] || 0) ? prev : genderObj[cur]), 1)
    const yLoc = gEnd.y - graph.y * (tallestBar / maxLineHeight.current)
    const { xPercent: center, yPercent: bottom } = pixelToPercent(gEnd.x - timeSlotSpread - 2 * barWidth, yLoc)
    const statsObj = { center, bottom, values: statsObjGenders }
    const selectHeight = Math.max(graph.y * (tallestBar / maxLineHeight.current), 20)
    return (
      <g
        key={timeSlot}
        onMouseOver={() => setStatsWindow(statsObj)}
        onMouseOut={() => setStatsWindow(null)}
        onFocus={() => setStatsWindow(statsObj)}
        onBlur={() => setStatsWindow(null)}
      >
        <rect
          height={selectHeight}
          width={barWidth * 4}
          y={gEnd.y - selectHeight}
          x={gEnd.x - timeSlotSpread - 4 * barWidth}
          opacity=".3"
          rx="5"
          ry="5"
        />
        {GENDERS.map((v, idx) => {
          const height = Math.max(graph.y * ((genderObj[v] || 0) / maxLineHeight.current), 5)
          const genderSpread = idx * barWidth
          return (
            <Bar
              key={v}
              stroke="black"
              strokeWidth=".5"
              fill={`url(#grad${v})`}
              x={gEnd.x - timeSlotSpread - genderSpread - barWidth}
              y={gEnd.y - height}
              height={height}
              width={barWidth}
              rx={barWidth / 3}
              ry={barWidth / 3}
            />
          )
        })}
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
            x={gStart.x + intSpace.x * idx + 2 * barWidth}
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
  }, [])

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
    if (minuteSpread < 60 * 3) return 'Users By Minutes ago'
    if (minuteSpread < 60 * 24 * 3) return 'Users By Hours ago'
    if (minuteSpread < 60 * 24 * 96) return 'Users By Days ago'
    return 'Users By Months ago'
  }

  const handleMinuteSpreadChange = e => {
    e.preventDefault()
    setMinuteSpread(e.target.value)
  }

  return (
    <StyledBarGraph>
      <SVGContainer
        width="100%"
        style={{ height: 'auto' }}
        viewBox={`0 0 ${vb.x} ${vb.y}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gradMALE" x1="0%" y1="0%" x2="0" y2="100%">
            <stop offset="0%" stopColor={GENDER_COLORS.MALE} stopOpacity="1" />
            <stop offset="100%" stopColor={GENDER_COLORS.MALE} stopOpacity=".2" />
          </linearGradient>
          <linearGradient id="gradFEMALE" x1="0%" y1="0%" x2="0" y2="100%">
            <stop offset="0%" stopColor={GENDER_COLORS.FEMALE} stopOpacity="1" />
            <stop offset="100%" stopColor={GENDER_COLORS.FEMALE} stopOpacity=".2" />
          </linearGradient>
          <linearGradient id="gradM2F" x1="0%" y1="0%" x2="0" y2="100%">
            <stop offset="0%" stopColor={GENDER_COLORS.M2F} stopOpacity="1" />
            <stop offset="100%" stopColor={GENDER_COLORS.M2F} stopOpacity=".2" />
          </linearGradient>
          <linearGradient id="gradF2M" x1="0%" y1="0%" x2="0" y2="100%">
            <stop offset="0%" stopColor={GENDER_COLORS.F2M} stopOpacity="1" />
            <stop offset="100%" stopColor={GENDER_COLORS.F2M} stopOpacity=".2" />
          </linearGradient>
        </defs>
        <path d={`M${gStart.x} ${gEnd.y} H ${gEnd.x} V ${gStart.y}`} className="graph-axis" />
        <text x={vb.x * 0.1} y={vb.y * 0.1} fill="#ccc" textAnchor="left" fontSize={titleSize}>
          {getTitle()}
        </text>
        <g>{printGrid()}</g>
        {printAxis()}
        {printLegend()}
        {timeGroupings && timeGroupings.map((_, idx) => idx < timeGroupings.length - 1 && buildBars(idx))}
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
        <Select value={minuteSpread} onChange={handleMinuteSpreadChange} style={{ color: 'white' }}>
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
    </StyledBarGraph>
  )
}
