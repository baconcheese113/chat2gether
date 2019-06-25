import { gql } from 'apollo-boost'

export const CREATE_USER = gql`
  mutation CreateUserMutation($data: CreateUserInput!) {
    createUser(data: $data) {
      user {
        id
        gender
        lastActive
        age
        minAge
        maxAge
      }
    }
  }
`
export const UPDATE_USER = gql`
  mutation UpdateUserMutation($data: UserUpdateInput!) {
    updateUser(data: $data) {
      id
      gender
      age
      minAge
      maxAge
      isHost
      isConnected
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
