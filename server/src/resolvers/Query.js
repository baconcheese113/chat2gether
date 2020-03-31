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
    return users.filter(value => value.id !== userId)
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
      gender
      lookingFor { name }
      age
      minAge
      maxAge
      audioPref
      accAudioPrefs { name }
      visited { id } 
    }`,
    )
    console.log('user', user, 'info', info)
    const d = new Date()
    d.setMinutes(d.getMinutes() - 0.25)
    const potentialMatch = await prisma.query.users(
      {
        where: {
          AND: [
            { id_not: userId },
            { id_not_in: user.visited.map(x => x.id) },
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
            { visited_none: { id: userId } },
            { updatedAt_gt: d.toISOString() },
          ],
        },
        first: 1,
      },
      info,
    )
    console.log('potentialMatch', potentialMatch)
    const [match] = potentialMatch
    return match
  },
}
