import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';
import { gql } from 'apollo-server';

import { Account } from '../../src/models';

const UPDATE_VIRTUAL_BALANCE = gql`
  mutation updateVirtualBalance($id: ID!, $context: String!, $amount: Float!) {
    updateVirtualBalance(account: $id, context: $context, delta: $amount)
  }
`;

Given('the amount to be set as new virtual balance is {int}', async function (amount) {
  this.newVirtualBalance = amount;
});

When('client wants to update a virtual balance', async function () {
  this.accountToUpdate = (await Account.find({}))[3];
  const accountID = this.accountToUpdate.id;

  this.response = await this.mutate({
    mutation: UPDATE_VIRTUAL_BALANCE,
    variables: {
      id: accountID,
      context: this.context,
      amount: this.newVirtualBalance,
    },
  });
});

Then('the virtual balance of the given context should equal to the new given amount', async function () {
  if (this.delta > -1) {
    const updatedAccount: any = await Account.findById(this.accountToUpdate.id);
    const updatedContext = updatedAccount.contexts.find((context) => context.name === this.context);
    const updatedVirtualBalance = updatedContext.virtualBalance;

    expect(updatedVirtualBalance).to.equal(this.newVirtualBalance);
  }
});
