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
}
