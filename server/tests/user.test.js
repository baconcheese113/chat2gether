import 'cross-fetch/polyfill'
import prisma from '../src/prisma'
import seedDatabase, { userOne } from './utils/seedDatabase'
import getClient from './utils/getClient'
import { createUser, getUsers, login, getProfile} from './utils/operations'

const client = getClient()

beforeEach(seedDatabase)



test('should create a new user', async () => {
  const variables = {
    data: {
      name: 'Andrew',
      email: 'andrew@example.com',
      password: 'MyPass123'
    }
  }
  const response = await client.mutate({
    mutation: createUser,
    variables
  })
  const userExists = await prisma.exists.User({id: response.data.createUser.user.id})
  expect(userExists).toBe(true)
})

test('should expose public author profiles', async () => {

  const response = await client.query({query: getUsers})

  expect(response.data.users.length).toBe(2)
  expect(response.data.users[0].email).toBe(null)
  expect(response.data.users[0].name).toBe('Jen')
})

test('should not login with bad credentials', async () => {
  const variables = {
    data: {
      email: "jen@example.com",
      password: "nottherightpassword"
    }
  }
  await expect(client.mutate({mutation: login, variables})).rejects.toThrow()
})

test('should not signup with short password', async () => {
  const variables = {
    data: {
      name: 'Hacker',
      email: 'notgonnagiveit@nope.com',
      password: '123456'
    }
  }
  await expect(client.mutate({mutation: createUser, variables})).rejects.toThrow()
})

test('should not signup with duplicate email', async () => {
  const variables = {
    data: {
      name: 'Jen',
      email: 'jen@example.com',
      password: 'itdoesntmatter',
    }
  }
  await expect(client.mutate({mutation: createUser, variables})).rejects.toThrow()
})

test('should provide authentication token from login', async () => {
  const variables = {
    data: {
      email: 'jen@example.com',
      password: 'GreatPass123'
    }
  }
  const {data} = await client.mutate({mutation: login, variables})
  expect(data.login.token).toBeDefined()
})

test('should reject me query without authentication', async () => {
  await expect(client.query({query: getProfile})).rejects.toThrow()
})


test('should fetch user profile', async () => {
  const client = getClient(userOne.jwt)
  const {data} = await client.query({query: getProfile})
  expect(data.me.id).toBe(userOne.user.id)
  expect(data.me.name).toBe(userOne.user.name)
  expect(data.me.email).toBe(userOne.user.email)
})

test('should hide emails when fetching list of users', async () => {
  const {data} = await client.query({query: getUsers})
  data.users.forEach(user => {
    expect(user.email).toBeNull()
  })
})
