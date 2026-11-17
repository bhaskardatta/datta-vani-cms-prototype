@P1 @J8
Feature: Permissions
  Three roles: Content Manager, Super Admin, Support Lead.
  Buttons a role cannot use stay visible but disabled, and say why. The service refuses them too.

  @FR-PERM-01
  Scenario: A Content Manager is stopped from touching production
    Given I am signed in as a Content Manager
    When I switch to production
    Then every edit control is read-only
    And "Promote to production" says "Only a Super Admin can promote"
    And the on/off switches say "Only a Super Admin can switch content on or off in production"

  @FR-PERM-02
  Scenario: The service refuses a production edit even if the screen allowed it
    Given I am signed in as a Content Manager
    And I am on production
    When an edit request is sent anyway
    Then nothing is changed
    And nothing is added to the activity log

  @FR-PERM-03
  Scenario Outline: Who can do what
    Given I am signed in as a <role>
    Then on <environment> I <can edit> edit content
    And I <can switch> switch content on or off
    And I <can promote> promote

    Examples:
      | role            | environment | can edit | can switch | can promote |
      | Content Manager | staging     | can      | can        | cannot      |
      | Content Manager | production  | cannot   | cannot     | cannot      |
      | Super Admin     | staging     | can      | can        | can         |
      | Super Admin     | production  | cannot   | can        | can         |
      | Support Lead    | staging     | cannot   | cannot     | cannot      |
      | Support Lead    | production  | cannot   | cannot     | cannot      |

  @FR-PERM-05
  Scenario: The promote page opened directly by someone else
    Given I am signed in as a Content Manager
    When I open "/promote" directly
    Then I see "Only a Super Admin can promote" with a link back to the Library
    And the promote wizard is not shown

  @FR-PERM-04
  Scenario: Only a Super Admin approves and reverts
    Given I am signed in as a Content Manager
    Then "Approve" says "Only a Super Admin can approve"
    And reverting a promote is refused
