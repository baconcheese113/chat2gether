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
  console.log('MyUserProvider render')

  const client = useApolloClient()

  const getMe = React.useCallback(async () => {
    // setUser(updatedUser)
    const { data, error } = await client.query({ query: GET_ME })
    if (data.me) {
      setUser(data.me)
    }
    console.log(data, error)
    return data.me
  }, [client])

  React.useEffect(() => {
    getMe()
  }, [getMe])

  return <MyUserContext.Provider value={{ user, getMe }}>{user ? children : ''}</MyUserContext.Provider>
}
