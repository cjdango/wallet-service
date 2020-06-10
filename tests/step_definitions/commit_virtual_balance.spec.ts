import { expect } from 'chai';
import { When, Then } from 'cucumber';
import { gql } from 'apollo-server';

import { Account } from '../../src/models';

const COMMIT_RESERVED_BALANCE = gql`
  mutation commitVirtualBalance($id: ID!, $context: String!) {
    commitVirtualBalance(account: $id, context: $context)
  }
`;

When('client wants to commit a virtual balance', async function () {
  this.accountToUpdate = (await Account.find({}))[3];
  this.contextToUpdate = this.accountToUpdate.contexts.find((context) => context.name === this.context);

  const accountID = this.accountToUpdate.id;

  this.response = await this.mutate({
    mutation: COMMIT_RESERVED_BALANCE,
    variables: {
      id: accountID,
      context: this.context,
    },
  });
});

Then("the virtual balance should be added to the account's balance", async function () {
  const updatedAccount: any = await Account.findById(this.accountToUpdate.id);
  this.updatedContext = updatedAccount.contexts.find((context) => context.name === this.context);
  expect(updatedAccount.balance - this.accountToUpdate.balance).to.equal(this.contextToUpdate.virtualBalance);
});
