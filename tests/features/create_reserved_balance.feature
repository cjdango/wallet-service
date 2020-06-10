Feature: Creating/Adding reserve balance
  Should be able to create a reserved balance

  Scenario Outline: Adding to an account reserved balance
    Given there are accounts in the database
    And the context is "<context>"
    And the amount to be reserved is <amount>
    When client wants to create a reserved balance
    Then the reserved balance of the given context should be updated
    And the given amount should be subtracted to the account balance


    Examples:
      | context | amount |
      | game1   | 34     |
      | game2   | 94     |
