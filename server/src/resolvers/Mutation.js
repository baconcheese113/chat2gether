import getUserId from '../utils/getUserId';
import generateToken from '../utils/generateToken';
import cookieParser from 'cookie-parser';

export default {
  async createUser(parent, args, { prisma, request }, info) {
    const lastActive = new Date().toISOString();
    const user = await prisma.mutation.createUser({
      data: { ...args.data, lastActive, isHost: false, isConnected: false }
    });
    const token = generateToken(user.id);
    const options = {
      maxAge: 1000 * 60 * 60 * 72 //expires in 3 days
      // httpOnly: true, // cookie is only accessible by the server
      // secure: process.env.NODE_ENV === 'prod', // only transferred over https
      // sameSite: true, // only sent for requests to the same FQDN as the domain in the cookie
    };
    request.res.cookie('token', token, options);
    return { user };
  },
  async deleteUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);

    return prisma.mutation.deleteUser({ where: { id: userId } }, info);
  },

  async updateUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);

    return prisma.mutation.updateUser(
      {
        where: { id: userId },
        data: args.data
      },
      info
    );
  }
};
