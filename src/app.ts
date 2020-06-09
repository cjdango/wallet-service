import { ApolloServer } from 'apollo-server';

import typeDefs from './typedefs';
import resolvers from './resolvers';

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return {
      requestID: req.headers['x-request-id'],
    };
  },
});
