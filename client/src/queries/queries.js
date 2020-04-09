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
      visited {
        id
        gender
        age
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
      visited {
        id
        gender
        age
      }
      reportsMade {
        type
        offender {
          id
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
      visited {
        id
        gender
        age
      }
    }
  }
`
