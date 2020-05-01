import React from 'react'
import { useApolloClient } from '@apollo/client'
import { GET_ME } from '../queries/queries'

const MyUserContext = React.createContext({})
export function useMyUser() {
  return React.useContext(MyUserContext)
}

export default function MyUserProvider(props) {
  const { children } = props
  const [user, setUser] = React.useState()

  const client = useApolloClient()

  const getMe = React.useCallback(async () => {
    const { data } = await client.query({ query: GET_ME, fetchPolicy: 'network-only' })
    if (data.me) {
      setUser(data.me)
    }
    return data.me
  }, [client])

  React.useEffect(() => {
    getMe()
  }, [getMe])

  return <MyUserContext.Provider value={{ user, getMe }}>{user ? children : ''}</MyUserContext.Provider>
}
