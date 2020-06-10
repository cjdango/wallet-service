Feature: Commit virtual balance
  Should be able to commit a virtual balance

  Scenario Outline: Committing an account's virtual balance
    Given there are accounts in the database that has virtual balance to "<context>"
    When client wants to commit a virtual balance
    Then the virtual balance should be added to the account's balance
    And the virtual balance of the given context should equal 0


    Examples:
      | context |
      | game1   |
      | game2   |
