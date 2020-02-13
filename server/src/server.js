import ApolloServerExpress from 'apollo-server-express';
import { resolvers, fragmentReplacements } from './resolvers/index';
import prisma from './prisma';
import GQLImport from 'graphql-import';

const pubsub = new ApolloServerExpress.PubSub();

export default new ApolloServerExpress.ApolloServer({
  typeDefs: GQLImport.importSchema('./src/schema.graphql'),
  resolvers,
  context(request) {
    return { pubsub, prisma, request };
  },
  fragmentReplacements,
  debug: true
});
