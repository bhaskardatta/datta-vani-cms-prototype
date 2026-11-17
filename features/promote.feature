@P1 @J6
Feature: Promote staging to production
  A Super Admin copies an approved item from staging into production, for the languages they choose.

  Background:
    Given I am signed in as a Super Admin
    And "Book of Datta" is approved on staging
    And production has an older, English-only copy of "Book of Datta"

  @FR-PRO-01
  Scenario: Match the staging item to the production item
    When I start the promote for "Book of Datta"
    Then the CMS matches it to the production "Book of Datta" by its saved match, not by ID

  @FR-PRO-02
  Scenario: See the changes before promoting
    Given production has an older copy of "Ramayana" with one chunk changed and one chunk missing
    When I review the changes for "Ramayana" in English
    Then I see 1 new chunk, 1 changed chunk and 7 unchanged chunks
    And each changed chunk shows its text before and after
    And no deletions are listed

  @FR-PRO-03
  Scenario: Pre-promote checks
    When I reach the checks step
    Then I see each pre-promote check as passed, failed or pending
    And a failed blocker stops the promote

  @FR-PRO-04
  Scenario: Type to confirm
    Given the dry run finished cleanly
    When I type the item name "Book of Datta" and the word "production"
    Then "Promote" is enabled

  @FR-PRO-05
  Scenario: Production IDs are kept
    Given the production "Book of Datta" has ID "prod-datta-77"
    When I promote "Book of Datta" in English and Telugu
    Then the production item still has ID "prod-datta-77"
    And every production row keeps its ID

  @FR-PRO-06
  Scenario: Promote never deletes
    Given a chunk exists only in the production copy
    When I promote the item
    Then that chunk is still in production
    And the number of production items is the same or higher

  @FR-PRO-07
  Scenario: A new item lands switched off
    Given "Little Dhruva's Prayer" is not in production
    When I promote it in English
    Then it is created in production switched off
    And only English is marked on

  @FR-PRO-08
  Scenario: An existing item keeps its switches
    Given the production "Book of Datta" is switched on and Telugu is off
    When I promote "Book of Datta" in English and Telugu
    Then the production "Book of Datta" is still switched on
    And Telugu is still off

  @FR-PRO-09
  Scenario: Languages that are not chosen are not touched
    Given the production copy has Kannada text "ಉತ್ಪಾದನೆಯ ಪಠ್ಯ" on a chunk
    When I promote in English and Telugu only
    Then that chunk still has the Kannada text "ಉತ್ಪಾದನೆಯ ಪಠ್ಯ" in production
    And its Kannada audio is not changed

  @FR-PRO-10
  Scenario Outline: What can be promoted
    Given the item is <status>
    And I choose <languages>
    Then the promote is <result>

    Examples:
      | status    | languages                           | result                                     |
      | approved  | English, Telugu, Kannada            | allowed                                    |
      | approved  | Telugu                              | blocked: "English must be included"        |
      | in review | English                             | blocked: "Approve it first"                |
      | approved  | English, Telugu (Telugu has errors) | blocked: "Fix the errors in Telugu first"  |

  @FR-PRO-11
  Scenario: A snapshot is saved, so the promote can be reverted
    Given I promoted "Ramayana" in English and Telugu
    When I press "Revert this promote"
    Then production "Ramayana" is exactly as it was before the promote
    And the activity log says "Reverted promote"

  @FR-PRO-12
  Scenario: Reverting a new item switches it off but does not delete it
    Given I promoted "Little Dhruva's Prayer" for the first time
    When I revert that promote
    Then it is still in production, switched off

  @FR-PRO-13
  Scenario: Revert with nothing to undo does nothing
    Given "Ramayana" has not been promoted since the last revert
    When I revert "Ramayana"
    Then production is not changed

  @FR-PRO-14
  Scenario: Promote is audited
    When I promote "Book of Datta"
    Then the activity log has an entry "Promoted to production" in production, naming the languages
