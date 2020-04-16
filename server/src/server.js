import ApolloServerExpress from 'apollo-server-express'
import GQLImport from 'graphql-import'
import { resolvers, fragmentReplacements } from './resolvers/index'
import prisma from './prisma'

// const pubsub = new ApolloServerExpress.PubSub()

export default new ApolloServerExpress.ApolloServer({
  typeDefs: GQLImport.importSchema('./src/schema.graphql'),
  resolvers,
  context(request) {
    return { prisma, request }
  },
  fragmentReplacements,
  // debug: true,
})
