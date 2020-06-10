Feature: Updating reserved balance
  Should be able to update a reserved balance

  Scenario Outline: Updating an account's reserved balance
    Given there are accounts in the database
    And the context is "<context>"
    And the amount to be set as new reserved balance is <amount>
    When client wants to update a reserved balance
    Then the reserved balance of the given context should equal to the new given amount
    But error if value is negative


    Examples:
      | context | amount |
      | game1   | 34     |
      | game2   | -94    |
