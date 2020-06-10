Feature: Cancel virtual balance
  Should be able to cancel a virtual balance

  Scenario Outline: Cancelling an account's virtual balance
    Given there are accounts in the database that has virtual balance to "<context>"
    When client wants to cancel a virtual balance
    Then the virtual balance of the given context should equal 0


    Examples:
      | context |
      | game1   |
      | game2   |
