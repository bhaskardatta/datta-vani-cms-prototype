@P1 @J9
Feature: Activity log (audit)
  Every change is written down. Entries are never edited or removed.

  @FR-AUDIT-01
  Scenario: See who changed what
    Given a Content Manager changed a Telugu sentence in "Ramayana"
    When I open "Activity"
    Then the newest entry is first
    And it shows who, what, where, before, after and when

  @FR-AUDIT-02
  Scenario: Filter the log
    When I filter the activity by environment "production"
    Then I only see production entries
    When I filter by action "Promoted to production"
    Then I only see promotes

  @FR-AUDIT-03
  Scenario Outline: These changes are logged
    When someone <does something>
    Then the activity log has an entry "<action>"

    Examples:
      | does something                       | action                     |
      | edits Telugu text                    | Edited Telugu text         |
      | regenerates Telugu female audio      | Regenerated Telugu female audio and transcript (draft) |
      | approves Telugu female audio         | Approved Telugu female audio and transcript |
      | sends an item for review             | Sent for review            |
      | approves an item                     | Approved                   |
      | edits an approved item               | Approval cleared           |
      | promotes                             | Promoted to production     |
      | reverts a promote                    | Reverted promote           |
      | switches an item on                  | Switched on                |
      | switches Telugu on                   | Telugu switched on         |
      | creates a bedtime story              | Created bedtime story      |

  @FR-AUDIT-04
  Scenario: The log is append-only
    Given the log has 4 entries
    When a new change is made
    Then the log has 5 entries
    And the 4 older entries are unchanged

  @FR-AUDIT-05
  Scenario: A refused action is not logged
    Given I am signed in as a Content Manager
    When I try to promote
    Then nothing is added to the activity log
