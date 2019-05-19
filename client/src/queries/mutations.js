import { gql } from 'apollo-boost'

export const CREATE_USER = gql`
  mutation CreateUserMutation($data: CreateUserInput!) {
    createUser(data: $data) {
      user {
        id
        gender
        lookingFor
        lastActive
      }
    }
  }
`
export const UPDATE_USER = gql`
  mutation UpdateUserMutation($data: UserUpdateInput!) {
    updateUser(data: $data) {
      id
      gender
      lookingFor
      isHost
      isConnected
    }
  }
`
