import React from 'react'
import styled from 'styled-components'
import { useApolloClient } from '@apollo/client'
import Header from './Header'
import UserCreate from './UserCreate'
import ChatHub from './ChatHub'
import { LocalStreamProvider } from '../hooks/LocalStreamContext'
import { EnabledWidgetsProvider } from '../hooks/EnabledWidgetsContext'
import { NotifyProvider } from '../hooks/NotifyContext'
import SocketProvider from '../hooks/SocketContext'
import { GET_ME } from '../queries/queries'
import MyUserProvider from '../hooks/MyUserContext'
import useWindowSize from '../hooks/WindowSizeHook'

/**
 * App just handles passing to UserCreate, and passing to ChatHub
 * UserCreate handles registering User or logging in with existing token
 * ChatHub handles finding room, sharing audio/video, socket connectivity, settings
 * TextChat handles rendering chat and socket transmissions
 * VideoWindow handles rendering streams (local and remote)
 */

const StyledApp = styled.div`
  height: ${p => p.height}px;
  display: flex;
`

export default function App() {
  const [user, setUser] = React.useState(null)
  const [canRender, setCanRender] = React.useState(false)

  const client = useApolloClient()
  const { innerHeight } = useWindowSize()

  React.useEffect(() => {
    if (document.cookie.split(';').filter(item => item.trim().startsWith('token=')).length === 0) {
      setCanRender(true)
      return
    }
    console.log('Cookie found, proceeding')
    const fetchData = async () => {
      const { data, error } = await client.query({ query: GET_ME })
      if (data.me) {
        setUser(data.me)
      }
      console.log(data, error)
      setCanRender(true)
    }
    fetchData()
  }, [client])

  if (canRender) {
    if (user) {
      return (
        <StyledApp height={innerHeight}>
          <MyUserProvider>
            <EnabledWidgetsProvider>
              <SocketProvider>
                <LocalStreamProvider>
                  <NotifyProvider>
                    <ChatHub user={user} />
                  </NotifyProvider>
                </LocalStreamProvider>
              </SocketProvider>
            </EnabledWidgetsProvider>
          </MyUserProvider>
        </StyledApp>
      )
    }
    return (
      <div>
        <Header />
        <UserCreate setUser={setUser} />
      </div>
    )
  }
  return ''
}
