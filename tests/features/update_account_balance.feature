Feature: Update an account balance
  Should be able to update an account balance

  Scenario Outline: Updating an account balance
    Given there are accounts in the database
    When client wants to update an account balance with <delta> value
    Then he should receive true as a response
    And the account should have the updated value
    But error if value is negative

    Examples:
      | delta |
      | 4     |
      | -4    |
