import { gql } from 'apollo-server';

export default gql`
  scalar Binary

  type Account {
    id: ID!
    balance: Float!
    reservedBalance(context: String!): Float!
    virtualBalance(context: String!): Float!
    availableBalance(context: String!): Float!
  }

  type PageInfo {
    endCursor: Binary
    hasNextPage: Boolean!
  }

  type AccountsConnectionEdge {
    node: Account!
    cursor: Binary!
  }

  type AccountsConnection {
    totalCount: Int!
    edges: [AccountsConnectionEdge]!
    pageInfo: PageInfo!
  }

  type Query {
    account(id: ID!): Account!
    accounts(first: Int, after: Binary): AccountsConnection!
  }

  type Mutation {
    updateBalance(account: ID!, delta: Float!): Boolean!
    createReservedBalance(account: ID!, context: String!, amount: Float!): Boolean!
    updateReservedBalance(account: ID!, context: String!, delta: Float!): Boolean!
    releaseReservedBalance(account: ID!, context: String!): Boolean!
    updateVirtualBalance(account: ID!, context: String!, delta: Float!): Boolean!
    cancelVirtualBalance(account: ID!, context: String!): Boolean!
    commitVirtualBalance(account: ID!, context: String!): Boolean!
  }
`;
