Feature: Release reserved balance
  Should be able to release a reserved balance

  Scenario Outline: Releasing an account's reserved balance
    Given there are accounts in the database that has reserved balance to "<context>"
    When client wants to release a reserved balance
    Then the reserved balance should be added to the account's balance
    And the reserved balance of the given context should equal 0


    Examples:
      | context |
      | game1   |
      | game2   |
