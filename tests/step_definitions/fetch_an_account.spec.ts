import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';
import { gql } from 'apollo-server';

import { Account } from '../../src/models';

const GET_ACCOUNT = gql`
  query getAccount($reservedBalanceContext: String!, $virtualBalanceContext: String!, $id: ID!) {
    account(id: $id) {
      id
      balance
      reservedBalance(context: $reservedBalanceContext)
      virtualBalance(context: $virtualBalanceContext)
    }
  }
`;

Given('there are accounts in the database', async function () {
  for (let index = 0; index < 10; index++) {
    await Account.create({ balance: 100 });
  }
});

When('client requests for an account by ID', async function () {
  this.accountToFetch = (await Account.find({}))[3];
  const accountID = this.accountToFetch.id;

  this.response = await this.query({
    query: GET_ACCOUNT,
    variables: {
      id: accountID,
      reservedBalanceContext: 'game1',
      virtualBalanceContext: 'game1',
    },
  });
});

Then('he should receive an account that corresponds to the given ID', async function () {
  expect(this.response.data.account.id).to.equal(this.accountToFetch.id);
});
