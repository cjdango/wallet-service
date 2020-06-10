import mongoose, { Schema, Document } from 'mongoose';

// updateBalance: idempotenct(args)(handler)

export function idempotency(handler) {
  return async (...args) => {
    const [_, __, context, ___] = args;

    const request: any = await CachedRequest.findOne({ requestID: context.requestID });

    if (request && request.error) {
      throw new Error(request.error);
    }

    if (request && request.result) {
      if (request.result._id) {
        request.result['id'] = request.result._id;
      }

      return request.result;
    }

    let result;
    let error;

    try {
      result = await handler(...args);
    } catch (err) {
      error = err.message;
      result = err;
    }

    await CachedRequest.create({
      requestID: context.requestID,
      result,
      error,
    });

    return result;
  };
}

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

const cachedRequestSchema = new Schema({
  requestID: { type: String, required: true, unique: true },
  result: Object,
  error: Object,
});

export const Account = mongoose.model('Account', accountSchema);
export const CachedRequest = mongoose.model('CachedRequest', cachedRequestSchema);
