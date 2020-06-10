Feature: Update virtual balance
  Should be able to update a virtual balance

  Scenario Outline: Updating an account's virtual balance
    Given there are accounts in the database
    And the context is "<context>"
    And the amount to be set as new virtual balance is <amount>
    When client wants to update a virtual balance
    Then the virtual balance of the given context should equal to the new given amount
    But error if value is negative


    Examples:
      | context | amount |
      | game1   | -5     |
      | game2   | 77     |
