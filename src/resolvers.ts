import { Account } from './models';
import mongoose, { mongo } from 'mongoose';

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
  Account: {
    reservedBalance: async (parent, { context }) => {
      return (await getContextObj(parent, context)).reservedBalance;
    },
    virtualBalance: async (parent, { context }) => {
      return (await getContextObj(parent, context)).virtualBalance;
    },
  },

  Query: {
    account: async (_, { id }) => {
      return getAccountObj(id);
    },
    // accounts: () =>
    //   Account.find({
    //     balance: { $ne: 0 },
    //     'contexts.reservedBalance': { $ne: 0 },
    //     'contexts.virtualBalance': { $ne: 0 },
    //   }),
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
