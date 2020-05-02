import getUserId from '../utils/getUserId'
import generateToken from '../utils/generateToken'

export default {
  async createUser(parent, args, { prisma, request }, info) {
    const lastActive = new Date().toISOString()
    let ip = request.req.connection.remoteAddress

    if (request.req.headers && request.req.headers['x-forwarded-for']) {
      ;[ip] = request.req.headers['x-forwarded-for'].split(',')
    }
    const user = await prisma.mutation.createUser({
      data: {
        ...args.data,
        lastActive,
        isHost: false,
        isConnected: false,
        ip,
        fingerprint: request.req.fingerprint.hash,
      },
      info,
    })
    const token = generateToken(user.id)
    const options = {
      maxAge: 1000 * 60 * 60 * 72, // expires in 3 days
      // httpOnly: true, // cookie is only accessible by the server
      // secure: process.env.NODE_ENV === 'prod', // only transferred over https
      // sameSite: true, // only sent for requests to the same FQDN as the domain in the cookie
    }
    console.log('user created: ', user.id)
    request.res.cookie('token', token, options)
    return user
  },
  async updateUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    return prisma.mutation.updateUser(
      {
        where: { id: userId },
        data: args.data,
      },
      info,
    )
  },

  async createFeedback(parent, args, { prisma }, info) {
    return prisma.mutation.createFeedback(
      {
        data: { ...args.data },
      },
      info,
    )
  },

  async createReport(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    const { type, offenderId } = args.data
    const offender = await prisma.query.user(
      { where: { id: offenderId } },
      `{reportsReceived { type reporter { id } }}`,
    )
    if (!offender) {
      throw new Error('Offender not valid')
    }
    // if reported before, throw error
    if (offender.reportsReceived.some(r => r.reporter.id === userId)) {
      throw new Error('Already reported this user')
    }
    // createReport
    const report = await prisma.mutation.createReport(
      { data: { type, offender: { connect: { id: offenderId } }, reporter: { connect: { id: userId } } } },
      info,
    )
    // if >=2 reports for same type, create ban
    const reportsOfThisType = offender.reportsReceived.filter(r => r.type === type)
    if (reportsOfThisType.length >= 2) {
      // HAMMER TIME
      const now = new Date()
      const endAt = new Date()
      endAt.setMinutes(now.getMinutes() + 15)
      await prisma.mutation.createBan({
        data: {
          reason: type,
          startAt: now.toISOString(),
          endAt: endAt.toISOString(),
          user: { connect: { id: offenderId } },
        },
      })
    }

    return report
  },

  async createMatch(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    const { otherUserId } = args.data
    const usersArr = [userId, otherUserId]
    // determine if there's already an active match between these two users
    const existingMatches = await prisma.query.matches(
      {
        where: { hasEnded: false, hostId_in: usersArr, clientId_in: usersArr },
      },
      info,
    )
    console.log('User/Host is ', userId, ' and client is ', otherUserId, ' existing matches -> ', existingMatches)
    if (existingMatches && existingMatches.length) return existingMatches[0]
    // determine if user is host or not
    const me = await prisma.query.user({ where: { id: userId } }, `{ isHost }`)
    const hostId = me.isHost ? userId : otherUserId
    const clientId = me.isHost ? otherUserId : userId
    // create and return new match
    return prisma.mutation.createMatch(
      { data: { hostId, clientId, creatorId: userId, users: { connect: [{ id: hostId }, { id: clientId }] } } },
      info,
    )
  },

  async disconnectMatch(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    const { id, type } = args.data
    // get matches where id and user is in users array
    const matches = await prisma.query.matches({ where: { id, users_some: { id: userId } } })
    if (!matches) throw new Error('Cannot disconnect that which does not exist')
    console.log('disconnect matches ', matches)

    if (matches[0].hasEnded) {
      return { updateMatch: matches[0] }
    }
    // return updated match with type, disconnectorId, and endedAt
    try {
      const updateMatch = await prisma.mutation.updateMatch(
        {
          where: { id },
          data: { disconnectType: type, disconnectorId: userId, endedAt: new Date(), hasEnded: true },
        },
        info,
      )
      return updateMatch
    } catch (e) {
      console.log('error disconnecting ', e)
    }
    return { updateMatch: { ...matches } }
  },
}
