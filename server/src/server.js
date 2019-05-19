import { ApolloServer, PubSub } from 'apollo-server-express';
import { resolvers, fragmentReplacements } from './resolvers/index';
import prisma from './prisma';
import { importSchema } from 'graphql-import';

const pubsub = new PubSub();

export default new ApolloServer({
  typeDefs: importSchema('./src/schema.graphql'),
  resolvers,
  context(request) {
    return { pubsub, prisma, request };
  },
  fragmentReplacements,
  debug: true
});
