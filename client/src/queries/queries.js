import { gql } from 'apollo-boost'

export const GET_USERS = gql`
  query Users {
    users {
      id
      gender
      lookingFor
      updatedAt
      createdAt
    }
  }
`

export const FIND_ROOM = gql`
  query FindRoom($where: UserWhereInput) {
    users(where: $where) {
      id
      gender
      lookingFor
      lastActive
      isConnected
      isHost
    }
  }
`

export const GET_ME = gql`
  query GetMe {
    me {
      id
      gender
      lookingFor
      lastActive
      isHost
      isConnected
    }
  }
`
