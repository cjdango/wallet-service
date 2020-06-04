import { ApolloServer } from 'apollo-server';

import typeDefs from './typedefs';
import resolvers from './resolvers';

export const server = new ApolloServer({
  typeDefs,
  resolvers,
});
