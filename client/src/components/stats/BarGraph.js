import React from 'react'
import styled from 'styled-components'
import { useApolloClient } from '@apollo/react-hooks'
import { GET_USERS } from '../../queries/queries'
import { GENDERS, GENDER_COLORS } from '../../helpers/constants'
import StatsWindow from './StatsWindow'

const containerXY = { x: 500, y: 500 }
const numIntervals = 4
const numIntervalsY = 4
const intervalRange = 60 * 24 * 4 // minutes
const barWidth = 12
const vb = { x: 500, y: 500 }
const graph = { x: vb.x * (3 / 5), y: vb.y * (3 / 5) }
const gStart = { x: vb.x / 5, y: vb.y / 5 }
const gEnd = { x: vb.x * (4 / 5), y: vb.y * (4 / 5) }
const intSpace = { x: (graph.x - 4 * barWidth) / numIntervals, y: graph.y / numIntervalsY }

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
`

const SVGContainer = styled.svg`
  height: 100%;
  width: 100%;
  /* background-color: red; */
`
const Bar = styled.rect`
  stroke-linecap: round;
`

export default function BarGraph() {
  const [statsWindow, setStatsWindow] = React.useState(null)
  const [users, setUsers] = React.useState([])
  const [timeGroupings, setTimeGroupings] = React.useState(Array(numIntervals + 1).fill({}))

  const maxLineHeight = React.useRef(0)

  const client = useApolloClient()

  const refreshUserCount = async () => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - intervalRange * numIntervals)
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
    if (!timeGroupings) return <g />
    const timeUsers = timeGroupings[timeSlot].users
    if (!timeUsers) return <g />
    const genderObj = timeUsers.reduce((prev, cur) => {
      return { ...prev, [cur.gender]: (prev[cur.gender] || 0) + 1 }
    }, {})
    const timeSlotSpread = timeSlot * intSpace.x
    // Calculations for Stats window
    const statsObjGenders = GENDERS.map(v => {
      return { title: v, text: genderObj[v] || '0', color: GENDER_COLORS[v] }
    })
    const tallestBar = GENDERS.reduce((prev, cur) => (prev > (genderObj[cur] || 0) ? prev : genderObj[cur]), 5)
    const yLoc = gEnd.y - graph.y * (tallestBar / maxLineHeight.current)
    const { xPercent: center, yPercent: bottom } = pixelToPercent(gEnd.x - timeSlotSpread - 2 * barWidth, yLoc)
    const statsObj = { center, bottom, values: statsObjGenders }
    return (
      <g
        onMouseOver={() => setStatsWindow(statsObj)}
        onMouseOut={() => setStatsWindow(null)}
        onFocus={() => setStatsWindow(statsObj)}
        onBlur={() => setStatsWindow(null)}
      >
        {GENDERS.map((v, idx) => {
          const height = Math.max(graph.y * ((genderObj[v] || 0) / maxLineHeight.current), 5)
          const genderSpread = idx * barWidth
          return (
            <Bar
              key={v}
              // stroke="url(#gradMale)" // {GENDER_COLORS[v]}
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

  React.useEffect(() => {
    ;(async () => {
      await refreshUserCount()
      // getTimeGroupings()
    })()
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
        <g>{printGrid()}</g>
        {timeGroupings && timeGroupings.map((_, idx) => buildBars(idx))}
      </SVGContainer>

      {statsWindow && (
        <StatsWindow bottom={statsWindow.bottom} center={statsWindow.center} values={statsWindow.values} />
      )}
    </StyledBarGraph>
  )
}
