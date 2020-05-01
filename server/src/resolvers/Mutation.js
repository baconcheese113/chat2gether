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
  async deleteUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    return prisma.mutation.deleteUser({ where: { id: userId } }, info)
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
}
