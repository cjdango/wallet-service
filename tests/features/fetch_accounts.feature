Feature: Fetching accounts
  Should be able to fetch paginated accounts

  Scenario Outline: Fetch a portion of all accounts
    Given there are <accountListLength> none zero balanced accounts
    And the client wants first <requestListLength> accounts after "<after>"
    When client requests for accounts
    Then he should receive maximum of <responseListLength> accounts
    And he should be able to identify if there's next page available
    And he should have access to the end cursor
    And there should be no retreived accounts with 0 balance

    Examples:
      | requestListLength | after           | accountListLength | responseListLength |
      | 4                 | SECOND_ACCOUNT  | 10                | 4                  |
      | 6                 | FOURTH_ACCOUNT  | 10                | 6                  |
      | 5                 | SEVENTH_ACCOUNT | 10                | 3                  |
