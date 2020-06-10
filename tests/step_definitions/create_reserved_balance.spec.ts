import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';
import { gql } from 'apollo-server';

import { Account } from '../../src/models';

const CREATE_RESERVED_BALANCE = gql`
  mutation createReservedBalance($id: ID!, $context: String!, $amount: Float!) {
    createReservedBalance(account: $id, context: $context, amount: $amount)
  }
`;

Given('the context is {string}', async function (context) {
  this.context = context;
});

Given('the amount to be reserved is {int}', async function (amount) {
  this.ammountToBeReserved = amount;
});

When('client wants to create a reserved balance', async function () {
  this.accountToUpdate = (await Account.find({}))[3];
  const accountID = this.accountToUpdate.id;

  this.response = await this.mutate({
    mutation: CREATE_RESERVED_BALANCE,
    variables: {
      id: accountID,
      context: this.context,
      amount: this.ammountToBeReserved,
    },
  });
});

Then('the reserved balance of the given context should be updated', async function () {
  const updatedAccount: any = await Account.findById(this.accountToUpdate.id);

  const updatedContext = updatedAccount.contexts.find((context) => context.name === this.context);
  const updatedReservedBalance = updatedContext.reservedBalance;

  expect(updatedReservedBalance).to.equal(this.ammountToBeReserved);
});

Then('the given amount should be subtracted to the account balance', async function () {
  const updatedAccount: any = await Account.findById(this.accountToUpdate.id);
  expect(updatedAccount.balance).to.equal(this.accountToUpdate.balance - this.ammountToBeReserved);
});
