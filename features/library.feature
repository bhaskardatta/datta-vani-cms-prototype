@P1 @J1
Feature: Library
  As a Content Manager
  I want to see every epic and bedtime story in one list
  So that I can tell at a glance what is live and which language is blocking

  Background:
    Given the staging environment has the epics "Ramayana", "Mahabharatam", "Book of Datta" and "Bhagavad Gita lessons"
    And the staging environment has the bedtime stories "The Kind Deer", "Little Dhruva's Prayer" and "The Clever Crow"

  @FR-LIB-01
  Scenario: See all content with its enabled state and language coverage
    Given I am signed in as a Content Manager
    When I open the library
    Then I see all the epics and bedtime stories
    And each row shows its review status
    And each row shows whether it is switched on in staging and in production
    And each row shows the coverage for English, Telugu and Kannada
    And each row shows how many validation errors it has

  @FR-LIB-02
  Scenario: Coverage counts only finished chunks
    Given "Ramayana" has 9 chunks
    And 6 of them have Telugu text with approved female and male audio
    When I open the library
    Then the Telugu coverage for "Ramayana" is 67%

  @FR-LIB-03
  Scenario: An optional voice does not lower coverage
    Given a chunk has Telugu text with approved female and male audio
    And its child voice audio is missing
    Then that chunk counts as covered for Telugu

  @FR-LIB-04
  Scenario: Find which book blocks Telugu
    Given "Ramayana" has 3 Telugu validation errors
    When I open the library
    Then the "Ramayana" row names Telugu as a language with errors

  @FR-LIB-05
  Scenario: Item not yet in production
    Given "Little Dhruva's Prayer" has never been promoted
    When I open the library
    Then its production state says it is not in production yet
