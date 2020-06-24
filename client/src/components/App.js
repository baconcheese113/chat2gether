import React from 'react'
import styled from 'styled-components'
import { useApolloClient } from '@apollo/client'
import { LocalStreamProvider } from '../hooks/LocalStreamContext'
import { EnabledWidgetsProvider } from '../hooks/EnabledWidgetsContext'
import { NotifyProvider } from '../hooks/NotifyContext'
import SocketProvider from '../hooks/SocketContext'
import { GET_ME } from '../queries/queries'
import MyUserProvider from '../hooks/MyUserContext'
import useWindowSize from '../hooks/WindowSizeHook'
import ChatHub from './ChatHub'
import UserCreate from './UserCreate'
import Header from './Header'

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
    const fetchData = async () => {
      const { data } = await client.query({ query: GET_ME, errorPolicy: 'all' })
      if (data && data.me) {
        setUser(data.me)
      }
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
      <>
        <Header />
        <UserCreate setUser={setUser} />
      </>
    )
  }
  return ''
}
