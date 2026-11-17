@P1 @J5 @J6
Feature: Review workflow
  An item moves draft → in review → approved. Only an approved item can be promoted.

  @FR-REV-01
  Scenario: Send for review
    Given I am signed in as a Content Manager
    And "Mahabharatam" is a draft
    When I press "Send for review"
    Then "Mahabharatam" is in review
    And the activity log says "Sent for review"

  @FR-REV-06
  Scenario: Send for review is blocked by validation errors
    Given I am signed in as a Content Manager
    And "Little Dhruva’s Prayer" is a draft with 1 error
    Then "Send for review" is disabled with the reason "Fix 1 error before sending for review"
    And the service refuses a send-for-review request anyway
    When I regenerate and approve the missing voice
    Then "Send for review" is enabled

  @FR-REV-07
  Scenario: Production shows the workflow buttons locked
    Given I am viewing an item in production
    Then "Send for review" is disabled with the reason "Production is read-only. Send for review on staging."
    And "Promote to production" is disabled with the reason "Promote from staging."

  @FR-REV-02
  Scenario: Super Admin approves
    Given I am signed in as a Super Admin
    And "Ramayana" is in review
    And "Ramayana" has no English errors
    When I press "Approve"
    Then "Ramayana" is approved

  @FR-REV-03
  Scenario: Approve is blocked by English errors
    Given I am signed in as a Super Admin
    And "The Clever Crow" has English errors
    Then "Approve" is disabled with the reason "Fix the English errors first"

  @FR-REV-04
  Scenario: A Content Manager cannot approve
    Given I am signed in as a Content Manager
    And "Ramayana" is in review
    Then "Approve" is disabled with the reason "Only a Super Admin can approve"

  @FR-REV-05
  Scenario: Promote needs approval first
    Given I am signed in as a Super Admin
    And "Ramayana" is in review
    Then "Promote to production" is disabled with the reason "Approve it first"
