import { gql } from 'apollo-boost'

export const CREATE_USER = gql`
  mutation CreateUserMutation($data: CreateUserInput!) {
    createUser(data: $data) {
      id
      gender
      lastActive
      age
      minAge
      maxAge
      audioPref
    }
  }
`
export const UPDATE_USER = gql`
  mutation UpdateUserMutation($data: UserUpdateInput!) {
    updateUser(data: $data) {
      id
      gender
      age
      lookingFor {
        name
      }
      minAge
      maxAge
      audioPref
      accAudioPrefs {
        name
      }
      isHost
      isConnected
      matches {
        users {
          id
          gender
          age
        }
        hostId
        clientId
        endedAt
        createdAt
      }
    }
  }
`
export const UPDATE_ADDRESSES = gql`
  mutation UpdateAddressesMutation($data: UpdateAddressesInput!) {
    updateAddresses(data: $data) {
      id
    }
  }
`

export const CREATE_FEEDBACK = gql`
  mutation CreateFeedbackMutation($data: FeedbackCreateInput!) {
    createFeedback(data: $data) {
      id
      text
    }
  }
`

export const CREATE_REPORT = gql`
  mutation CreateReportMutation($data: CreateReportInput!) {
    createReport(data: $data) {
      id
    }
  }
`

export const CREATE_MATCH = gql`
  mutation CreateMatchMutation($data: CreateMatchInput!) {
    createMatch(data: $data) {
      id
    }
  }
`

export const DISCONNECT_MATCH = gql`
  mutation DisconnectMatchMutation($data: DisconnectMatchInput!) {
    disconnectMatch(data: $data) {
      id
    }
  }
`
