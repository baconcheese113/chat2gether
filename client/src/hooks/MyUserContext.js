import React from 'react'
import { compose, graphql, withApollo } from 'react-apollo'
import { GET_ME } from '../queries/queries'

const MyUserContext = React.createContext({})
export function useMyUser() {
  return React.useContext(MyUserContext)
}

function MyUserProvider(props) {
  const { children, user: initialUser } = props

  const [user, setUser] = React.useState(initialUser)
  console.log('MyUserProvider render')

  const updateUser = async updatedUser => {
    setUser({ ...user, ...updatedUser })
    const { data, error } = await props.client.query({ query: GET_ME })
    if (data.me) {
      setUser({ ...user, ...data.me })
    }
    console.log(data, error)
    return user
  }

  return <MyUserContext.Provider value={{ user, updateUser }}>{children}</MyUserContext.Provider>
}

export default compose(graphql(GET_ME, { name: 'GET_ME' }))(withApollo(MyUserProvider))
