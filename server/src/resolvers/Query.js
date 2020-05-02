import getUserId from '../utils/getUserId'

export default {
  async users(parent, args, { prisma, request }, info) {
    const userId = getUserId(request, false)
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
      where: args.where,
    }
    const users = await prisma.query.users(opArgs, info)
    return users.filter(user => user.id !== userId)
  },
  me(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)
    return prisma.query.user(
      {
        where: { id: userId },
      },
      info,
    )
  },
  async findRoom(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)
    const user = await prisma.query.user(
      { where: { id: userId } },
      `{
      ip
      gender
      lookingFor { name }
      age
      minAge
      maxAge
      audioPref
      accAudioPrefs { name }
    }`,
    )
    // Make sure they're not banned
    const bans = await prisma.query.bans({
      where: { user: { OR: [{ id: userId }, { ip: user.ip }] }, endAt_gte: new Date() },
    })
    if (bans.length) {
      throw Error(`Please contact an admin`)
    }
    const d = new Date()
    d.setMinutes(d.getMinutes() - 0.25)
    const potentialMatch = await prisma.query.users(
      {
        where: {
          AND: [
            { id_not: userId },
            { gender_in: user.lookingFor.map(x => x.name) },
            { lookingFor_some: { name: user.gender } },
            { minAge_lte: user.age },
            { maxAge_gte: user.age },
            { age_lte: user.maxAge },
            { age_gte: user.minAge },
            { audioPref_in: user.accAudioPrefs.map(x => x.name) },
            { accAudioPrefs_some: { name: user.audioPref } },
            { isHost: true },
            { isConnected: false },
            { matches_none: { users_some: { id: userId }, disconnectType_not: 'REFRESH' } },
            { updatedAt_gt: d.toISOString() },
          ],
        },
        orderBy: 'updatedAt_DESC',
        first: 1,
      },
      info,
    )
    console.log('potentialMatch', potentialMatch)
    const [match] = potentialMatch
    return match
  },
  matches(parent, args, { prisma, request }, info) {
    getUserId(request)

    return prisma.query.matches(args, info)
  },
}
