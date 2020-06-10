import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';
import { gql } from 'apollo-server';

import { Account } from '../../src/models';

const CANCEL_VIRTUAL_BALANCE = gql`
  mutation cancelVirtualBalance($id: ID!, $context: String!) {
    cancelVirtualBalance(account: $id, context: $context)
  }
`;

Given('there are accounts in the database that has virtual balance to {string}', async function (context) {
  this.context = context;

  for (let index = 0; index < 10; index++) {
    await Account.create({ balance: 100, contexts: [{ name: context, reservedBalance: 0, virtualBalance: 30 }] });
  }
});

When('client wants to cancel a virtual balance', async function () {
  this.accountToUpdate = (await Account.find({}))[3];
  this.contextToUpdate = this.accountToUpdate.contexts.find((context) => context.name === this.context);

  const accountID = this.accountToUpdate.id;

  this.response = await this.mutate({
    mutation: CANCEL_VIRTUAL_BALANCE,
    variables: {
      id: accountID,
      context: this.context,
    },
  });
});

Then('the virtual balance of the given context should equal {int}', async function (expectedValue) {
  const updatedAccount: any = await Account.findById(this.accountToUpdate.id);
  const updatedContext = updatedAccount.contexts.find((context) => context.name === this.context);
  expect(updatedContext.virtualBalance).to.equal(expectedValue);
});
