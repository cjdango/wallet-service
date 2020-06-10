Feature: Fetching an account
  Should be able to fetch account by id

  Scenario: Fetch one account by ID
    Given there are accounts in the database
    When client requests for an account by ID
    Then he should receive an account that corresponds to the given ID
