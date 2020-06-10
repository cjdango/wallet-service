import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';
import { gql } from 'apollo-server';

import { Account } from '../../src/models';

const RELEASE_RESERVED_BALANCE = gql`
  mutation releaseReservedBalance($id: ID!, $context: String!) {
    releaseReservedBalance(account: $id, context: $context)
  }
`;

Given('there are accounts in the database that has reserved balance to {string}', async function (context) {
  this.context = context;

  for (let index = 0; index < 10; index++) {
    await Account.create({ balance: 100, contexts: [{ name: context, reservedBalance: 30, virtualBalance: 0 }] });
  }
});

When('client wants to release a reserved balance', async function () {
  this.accountToUpdate = (await Account.find({}))[3];
  this.contextToUpdate = this.accountToUpdate.contexts.find((context) => context.name === this.context);

  const accountID = this.accountToUpdate.id;

  this.response = await this.mutate({
    mutation: RELEASE_RESERVED_BALANCE,
    variables: {
      id: accountID,
      context: this.context,
    },
  });
});

Then("the reserved balance should be added to the account's balance", async function () {
  const updatedAccount: any = await Account.findById(this.accountToUpdate.id);
  this.updatedContext = updatedAccount.contexts.find((context) => context.name === this.context);
  expect(updatedAccount.balance - this.accountToUpdate.balance).to.equal(this.contextToUpdate.reservedBalance);
});

Then('the reserved balance of the given context should equal {int}', async function (expectedValue) {
  expect(this.updatedContext.reservedBalance).to.equal(expectedValue);
});
