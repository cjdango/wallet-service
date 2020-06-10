import mongoose from 'mongoose';
import { BeforeAll, Before, AfterAll, After } from 'cucumber';
import { createTestClient } from 'apollo-server-testing';

import { Account, CachedRequest } from '../src/models';
import { constructServer } from './utils';

BeforeAll(async function () {
  mongoose
    .connect('mongodb://127.0.0.1:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      user: 'test',
      pass: 'test',
    })
    .then(() => {
      console.log('successfully connected to the database');
    })
    .catch((err) => {
      console.log('error connecting to the database', err);
      process.exit();
    });
});

Before(async function () {
  const server = constructServer({ requestID: 'uniqueRequestID' });
  const { query, mutate } = createTestClient(server);

  this.query = query;
  this.mutate = mutate;
});

AfterAll(async function () {
  await mongoose.disconnect();
  console.log('successfully disconnected to the database');
});

After(async function () {
  await Account.deleteMany({});
  await CachedRequest.deleteMany({});
});
