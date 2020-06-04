import { Account } from './models';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

import { paginateResults, fromCursor, toCursor } from './utils';

const getAccountObj = async (id) => {
  const accountDoc = await Account.findById(id);

  if (!accountDoc) return Account.create({});

  return accountDoc;
};

const getContextObj = async (parent, context) => {
  let contextObj = parent.contexts.find((obj) => obj.name === context);

  if (!contextObj) {
    contextObj = { name: context, reservedBalance: 0, virtualBalance: 0 };
    parent.contexts.push(contextObj);
    await parent.save();
  }

  return contextObj;
};

export default {
  Binary: new GraphQLScalarType({
    name: 'Binary',
    serialize(value) {
      return toCursor(value);
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return fromCursor(ast.value);
      } else {
        return null;
      }
    },
    parseValue(value) {
      return fromCursor(value);
    },
  }),

  Account: {
    reservedBalance: async (parent, { context }) => {
      return (await getContextObj(parent, context)).reservedBalance;
    },
    virtualBalance: async (parent, { context }) => {
      return (await getContextObj(parent, context)).virtualBalance;
    },
  },

  AccountsConnectionEdge: {
    node: (parent) => parent,
    cursor: (parent) => parent._id,
  },

  Query: {
    account: async (_, { id }) => {
      return getAccountObj(id);
    },
    accounts: async (_, { first, after }) => {
      const allAccounts = await Account.find({
        balance: { $ne: 0 },
      });

      allAccounts.reverse();

      const accounts = paginateResults({
        after,
        pageSize: first,
        results: allAccounts,
      });

      return {
        totalCount: accounts.length,
        edges: accounts,
        pageInfo: {
          endCursor: accounts.length ? accounts[accounts.length - 1]._id : null,
          hasNextPage: accounts.length
            ? accounts[accounts.length - 1]._id !== allAccounts[allAccounts.length - 1]._id
            : false,
        },
      };
    },
  },

  Mutation: {
    updateBalance: async (_, { account, delta }) => {
      if (delta < 0) throw Error('Invalid delta');
      const accountDoc: any = await getAccountObj(account);
      accountDoc.balance = delta;
      accountDoc.save();
      return true;
    },
    createReservedBalance: async (_, { account, context, amount }) => {
      const accountDoc: any = await getAccountObj(account);
      const contextObj = await getContextObj(accountDoc, context);
      contextObj.reservedBalance += amount;
      accountDoc.balance -= amount;
      accountDoc.save();
      return true;
    },
    updateReservedBalance: async (_, { account, context, delta }) => {
      if (delta < 0) throw Error('Invalid delta');
      const accountDoc: any = await getAccountObj(account);
      const contextObj = await getContextObj(accountDoc, context);
      contextObj.reservedBalance = delta;
      accountDoc.save();
      return true;
    },
    releaseReservedBalance: async (_, { account, context }) => {
      const accountDoc: any = await getAccountObj(account);
      const contextObj = await getContextObj(accountDoc, context);
      accountDoc.balance += contextObj.reservedBalance;
      contextObj.reservedBalance = 0;
      accountDoc.save();
      return true;
    },
    updateVirtualBalance: async (_, { account, context, delta }) => {
      if (delta < 0) throw Error('Invalid delta');
      const accountDoc: any = await getAccountObj(account);
      const contextObj = await getContextObj(accountDoc, context);
      contextObj.virtualBalance = delta;
      accountDoc.save();
      return true;
    },
    cancelVirtualBalance: async (_, { account, context }) => {
      const accountDoc: any = await getAccountObj(account);
      const contextObj = await getContextObj(accountDoc, context);
      contextObj.virtualBalance = 0;
      accountDoc.save();
      return true;
    },
    commitVirtualBalance: async (_, { account, context }) => {
      const accountDoc: any = await getAccountObj(account);
      const contextObj = await getContextObj(accountDoc, context);
      accountDoc.balance += contextObj.virtualBalance;
      contextObj.virtualBalance = 0;
      accountDoc.save();
      return true;
    },
  },
};
