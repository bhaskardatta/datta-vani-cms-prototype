@P1 @J6
Feature: Switching items and languages on and off
  Every item has a root switch (is it visible?) and a switch per language.
  English is the fallback: when a language is off, families see English.

  Background:
    Given I am signed in as a Super Admin
    And I am on production

  @FR-SW-01
  Scenario: Switch an item on in production
    Given the production "Book of Datta" is switched off
    And it has no English errors
    When I switch it on
    Then families can see it
    And the activity log says "Switched on" in production

  @FR-SW-02
  Scenario: An item with English errors cannot be switched on
    Given the production "The Clever Crow" has English errors
    Then its switch is disabled with the reason "Fix the English errors before switching on"

  @FR-SW-03
  Scenario: Switch on a complete language
    Given the production "Book of Datta" has 100% Telugu coverage and no Telugu errors
    When I switch Telugu on
    Then Telugu is on for "Book of Datta"
    And the activity log says "Telugu switched on"

  @FR-SW-04
  Scenario: An incomplete language cannot be switched on
    Given the production "Ramayana" has no Telugu yet
    Then the Telugu switch is disabled with the reason "Telugu is not complete in production yet"
    And switching it on anyway is refused by the service

  @FR-SW-05
  Scenario: Switching off is always allowed
    Given Telugu is on for "Book of Datta"
    When I switch Telugu off
    Then Telugu is off and families see English instead

  @FR-SW-06
  Scenario: A Content Manager switches on staging only
    Given I am signed in as a Content Manager
    When I switch "Mahabharatam" on in staging
    Then it is on in the staging app
    But the production switches are disabled with the reason "Only a Super Admin can switch content on or off in production"
