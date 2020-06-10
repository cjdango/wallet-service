import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';
import { gql } from 'apollo-server';

import { Account } from '../../src/models';

const UPDATE_RESERVED_BALANCE = gql`
  mutation updateReservedBalance($id: ID!, $context: String!, $amount: Float!) {
    updateReservedBalance(account: $id, context: $context, delta: $amount)
  }
`;

Given('the amount to be set as new reserved balance is {int}', async function (amount) {
  this.ammountToBeReserved = amount;
});

When('client wants to update a reserved balance', async function () {
  this.accountToUpdate = (await Account.find({}))[3];
  const accountID = this.accountToUpdate.id;

  this.response = await this.mutate({
    mutation: UPDATE_RESERVED_BALANCE,
    variables: {
      id: accountID,
      context: this.context,
      amount: this.ammountToBeReserved,
    },
  });
});

Then('the reserved balance of the given context should equal to the new given amount', async function () {
  if (this.delta > -1) {
    const updatedAccount: any = await Account.findById(this.accountToUpdate.id);
    const updatedContext = updatedAccount.contexts.find((context) => context.name === this.context);
    const updatedReservedBalance = updatedContext.reservedBalance;

    expect(updatedReservedBalance).to.equal(this.ammountToBeReserved);
  }
});
