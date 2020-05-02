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
      audioPref
      accAudioPrefs {
        name
      }
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
      audioPref
      accAudioPrefs {
        name
      }
      lastActive
      isHost
      isConnected
      reportsMade {
        type
        offender {
          id
        }
      }
      matches(orderBy: endedAt_DESC) {
        id
        endedAt
        createdAt
        disconnectType
        users {
          id
          gender
          age
        }
      }
    }
  }
`
export const FIND_ROOM = gql`
  query FindRoom {
    findRoom {
      id
      gender
      lookingFor {
        name
      }
      age
      minAge
      maxAge
      audioPref
      accAudioPrefs {
        name
      }
      lastActive
      isHost
      isConnected
    }
  }
`
