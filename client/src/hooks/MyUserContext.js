import React from 'react'
import { useApolloClient } from '@apollo/react-hooks'
import { GET_ME } from '../queries/queries'

const MyUserContext = React.createContext({})
export function useMyUser() {
  return React.useContext(MyUserContext)
}

export default function MyUserProvider(props) {
  const { children, user: initialUser } = props

  const [user, setUser] = React.useState(initialUser)
  console.log('MyUserProvider render')

  const client = useApolloClient()

  const updateUser = async updatedUser => {
    setUser(updatedUser)
    const { data, error } = await client.query({ query: GET_ME })
    if (data.me) {
      setUser(data.me)
    }
    console.log(data, error)
    return data.me || updatedUser
  }

  return <MyUserContext.Provider value={{ user, updateUser }}>{children}</MyUserContext.Provider>
}
