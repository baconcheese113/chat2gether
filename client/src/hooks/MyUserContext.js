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

  React.useEffect(() => {
    getMe()
  }, [])

  const client = useApolloClient()

  const getMe = async () => {
    // setUser(updatedUser)
    const { data, error } = await client.query({ query: GET_ME })
    if (data.me) {
      setUser(data.me)
    }
    console.log(data, error)
    return data.me
  }

  return <MyUserContext.Provider value={{ user, getMe }}>{user ? children : ''}</MyUserContext.Provider>
}
