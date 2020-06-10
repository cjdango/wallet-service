import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';
import { gql } from 'apollo-server';

import { Account } from '../../src/models';

const UPDATE_ACCOUNT_BALANCE = gql`
  mutation updateBalance($id: ID!, $delta: Float!) {
    updateBalance(account: $id, delta: $delta)
  }
`;

When('client wants to update an account balance with {float} value', async function (delta) {
  this.delta = delta;
  this.accountToUpdate = (await Account.find({}))[3];
  const accountID = this.accountToUpdate.id;

  this.response = await this.mutate({
    mutation: UPDATE_ACCOUNT_BALANCE,
    variables: {
      id: accountID,
      delta,
    },
  });
});

Then('he should receive true as a response', async function () {
  if (this.delta > -1) {
    expect(this.response.data.updateBalance).to.be.true;
  }
});

Then('the account should have the updated value', async function () {
  const updatedAccount: any = await Account.findById(this.accountToUpdate.id);
  if (this.delta > -1) {
    expect(updatedAccount.balance).to.equal(this.delta);
  }
});

Then('error if value is negative', async function () {
  if (this.delta < 0) {
    expect(this.response.errors[0].message).to.equal('Invalid delta');
  }
});
