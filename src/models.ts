import mongoose, { Schema, Document } from 'mongoose';

const contextSchema = new Schema(
  {
    name: { type: String, required: true },
    reservedBalance: { type: Number, required: true, default: 0 },
    virtualBalance: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const accountSchema = new Schema({
  balance: { type: Number, required: true, default: 0 },
  contexts: [contextSchema]!,
});

export const Account = mongoose.model('Account', accountSchema);

// db.acccounts.insertOne({balance: 2.2,
//  context: [{name: 'game2', reservedBalance: 35, virtualBalance: 2.4}]
// })
