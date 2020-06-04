import { Account } from './models';
import mongoose, { mongo } from 'mongoose';

const getContextObj = async (parent, context) => {
  if (!(parent instanceof mongoose.Document)) {
    parent = await Account.findById(parent.id);
  }

  let contextObj = parent.contexts.find((obj) => obj.name === context);

  if (!contextObj) {
    contextObj = { name: context, reservedBalance: 0, virtualBalance: 0 };
    parent.contexts.push(contextObj);
    parent.save();
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
      try {
        id = mongoose.Types.ObjectId(id);
      } catch {}

      const accountObj = (
        await Account.aggregate([
          { $match: { _id: id } },
          {
            $project: {
              _id: 0,
              id: '$_id',
              balance: 1,
              contexts: {
                $filter: {
                  input: '$contexts',
                  as: 'item',
                  cond: { $gt: ['$$item.reservedBalance', 30] },
                },
              },
            },
          },
        ])
      )[0];

      if (!accountObj) return Account.create({});

      return accountObj;
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
      const accountDoc: any = await Account.findById(account);
      accountDoc.balance = delta;
      accountDoc.save();
      return true;
    },
    createReservedBalance: async (_, { account, context, amount }) => {
      const accountDoc: any = await Account.findById(account);
      const contextObj = accountDoc.contexts.find((obj) => obj.name === context);
      contextObj.reservedBalance += amount;
      accountDoc.balance -= amount;
      accountDoc.save();
      return true;
    },
  },
};
