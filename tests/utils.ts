import { ApolloServer } from 'apollo-server';

import typeDefs from '../src/typedefs';
import resolvers from '../src/resolvers';
import { Account } from '../src/models';

export const getAccountByPosition = async (position) => {
  const accounts = await Account.find({ balance: { $ne: 0 } });

  accounts.reverse();

  switch (position) {
    case 'SECOND_ACCOUNT':
      return accounts[1];

    case 'FOURTH_ACCOUNT':
      return accounts[3];

    case 'SEVENTH_ACCOUNT':
      return accounts[6];

    default:
      break;
  }
};

export const constructServer = (context = {}) =>
  new ApolloServer({
    typeDefs,
    resolvers,
    context,
  });
