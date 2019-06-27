import { gql } from 'apollo-boost'

export const GET_USERS = gql`
  query Users {
    users {
      id
      gender
      lookingFor {
        name
      }
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
      lookingFor {
        name
      }
      age
      minAge
      maxAge
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
      lookingFor {
        name
      }
      age
      minAge
      maxAge
      lastActive
      isHost
      isConnected
      visited {
        id
      }
    }
  }
`
