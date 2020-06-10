import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';
import { gql } from 'apollo-server';

import { Account } from '../../src/models';
import { toCursor } from '../../src/utils';
import { getAccountByPosition } from '../utils';

const GET_ACCOUNTS = gql`
  query getAccounts($reservedBalanceContext: String!, $virtualBalanceContext: String!, $first: Int!, $after: Binary!) {
    accounts(first: $first, after: $after) {
      totalCount
      edges {
        node {
          id
          balance
          reservedBalance(context: $reservedBalanceContext)
          virtualBalance(context: $virtualBalanceContext)
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

Given('the client wants first {int} accounts after {string}', async function (requestListLength, after) {
  const account = await getAccountByPosition(after);
  const cursor = toCursor(account.id);
  this.first = requestListLength;
  this.after = cursor;
});

Given('there are {int} none zero balanced accounts', async function (accountListLength) {
  for (let index = 0; index < accountListLength; index++) {
    await Account.create({ balance: 100 });
  }

  await Account.create({ balance: 0 });

  expect(await Account.countDocuments({ balance: { $ne: 0 } })).to.equal(accountListLength);
});

When('client requests for accounts', async function () {
  this.response = await this.query({
    query: GET_ACCOUNTS,
    variables: {
      first: this.first,
      after: this.after,
      reservedBalanceContext: 'game1',
      virtualBalanceContext: 'game1',
    },
  });
});

Then('he should receive maximum of {int} accounts', async function (responseListLength) {
  expect(Array.isArray(this.response.data.accounts.edges)).to.be.true;
  expect(this.response.data.accounts.edges.length).to.equal(responseListLength);
});

Then("he should be able to identify if there's next page available", async function () {
  expect(this.response.data.accounts.pageInfo.hasNextPage).to.be.a('boolean');
});

Then('he should have access to the end cursor', async function () {
  expect(this.response.data.accounts.pageInfo.endCursor).to.be.a('string');
  expect(this.response.data.accounts.pageInfo.endCursor).to.be.ok;
});

Then('there should be no retreived accounts with {int} balance', async function (balance) {
  const accountWithZeroBalance = this.response.data.accounts.edges.find((edge) => edge.node.balance === balance);
  expect(accountWithZeroBalance).to.be.not.ok;
});
