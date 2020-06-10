import { Account } from './models';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

import { paginateResults, fromCursor, toCursor } from './utils';
import { idempotency } from './models';
import mongoose from 'mongoose';

const getAccount = async (id) => {
  const accountDocument = await Account.findById(id);

  if (!accountDocument) return Account.create({});

  return accountDocument;
};

const getContext = async (parent, context) => {
  parent = await Account.findById(parent.id);

  let contextDocument = parent.contexts.find((obj) => obj.name === context);

  if (!contextDocument) {
    contextDocument = { name: context, reservedBalance: 0, virtualBalance: 0 };
    parent.contexts.push(contextDocument);
    await parent.save();
  }

  return contextDocument;
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
      return (await getContext(parent, context)).reservedBalance;
    },
    virtualBalance: async (parent, { context }) => {
      return (await getContext(parent, context)).virtualBalance;
    },
  },

  AccountsConnectionEdge: {
    node: (parent) => parent,
    cursor: (parent) => parent._id,
  },

  Query: {
    account: idempotency(async (_, { id }) => {
      return getAccount(id);
    }),

    accounts: idempotency(async (_, { first, after }) => {
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
    }),
  },

  Mutation: {
    updateBalance: idempotency(async (_, { account, delta }) => {
      if (delta < 0) throw Error('Invalid delta');
      const accountDocument: any = await getAccount(account);
      accountDocument.balance = delta;
      accountDocument.save();
      return true;
    }),
    createReservedBalance: idempotency(async (_, { account, context, amount }) => {
      const accountDocument: any = await getAccount(account);
      const contextDocument = await getContext(accountDocument, context);

      await Account.findOneAndUpdate(
        { _id: accountDocument.id, 'contexts.name': contextDocument.name },
        {
          $inc: {
            'contexts.$.reservedBalance': amount,
            balance: -amount,
          },
        },
      );

      return true;
    }),
    updateReservedBalance: idempotency(async (_, { account, context, delta }) => {
      if (delta < 0) throw Error('Invalid delta');
      const accountDocument: any = await getAccount(account);
      const contextDocument = await getContext(accountDocument, context);

      await Account.findOneAndUpdate(
        { _id: accountDocument.id, 'contexts.name': contextDocument.name },
        { $set: { 'contexts.$.reservedBalance': delta } },
      );

      return true;
    }),
    releaseReservedBalance: idempotency(async (_, { account, context }) => {
      const accountDocument: any = await getAccount(account);
      const contextDocument = await getContext(accountDocument, context);

      await Account.findOneAndUpdate(
        { _id: accountDocument.id, 'contexts.name': contextDocument.name },
        {
          $inc: { balance: contextDocument.reservedBalance },
          $set: { 'contexts.$.reservedBalance': 0 },
        },
      );

      return true;
    }),
    updateVirtualBalance: idempotency(async (_, { account, context, delta }) => {
      if (delta < 0) throw Error('Invalid delta');
      const accountDocument: any = await getAccount(account);
      const contextDocument = await getContext(accountDocument, context);

      await Account.findOneAndUpdate(
        { _id: accountDocument.id, 'contexts.name': contextDocument.name },
        { $set: { 'contexts.$.virtualBalance': delta } },
      );

      return true;
    }),
    cancelVirtualBalance: idempotency(async (_, { account, context }) => {
      const accountDocument: any = await getAccount(account);
      const contextDocument = await getContext(accountDocument, context);

      await Account.findOneAndUpdate(
        { _id: accountDocument.id, 'contexts.name': contextDocument.name },
        { $set: { 'contexts.$.virtualBalance': 0 } },
      );

      return true;
    }),
    commitVirtualBalance: idempotency(async (_, { account, context }) => {
      const accountDocument: any = await getAccount(account);
      const contextDocument = await getContext(accountDocument, context);

      await Account.findOneAndUpdate(
        { _id: accountDocument.id, 'contexts.name': contextDocument.name },
        {
          $inc: { balance: contextDocument.virtualBalance },
          $set: { 'contexts.$.virtualBalance': 0 },
        },
      );

      return true;
    }),
  },
};
