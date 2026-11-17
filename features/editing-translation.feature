@P1 @J2
Feature: Editing and translation
  As a Content Manager
  I want to fix Telugu and Kannada text found during testing
  So that families hear and read the right words

  Rule: Content is edited on staging only

    @FR-EDIT-01
    Scenario: Edit a Telugu sentence on staging
      Given I am signed in as a Content Manager
      And I am on staging
      And I open "Ramayana" in Telugu
      When I open "The King of Ayodhya › Scene 1 › Chunk 1"
      And I change the Telugu text
      Then the new Telugu text is saved on staging
      And production is not changed

    @FR-EDIT-02
    Scenario: Production is read-only for editing
      Given I am signed in as a Super Admin
      And I am on production
      When I open "Ramayana"
      Then every text box is read-only
      And I see "Production is read-only. Edit on staging, then promote"

  Rule: People translate; the CMS shows English next to the translation

    @FR-EDIT-03
    Scenario: English is shown above the Telugu box
      Given I open a chunk in Telugu
      Then I see the English sentence above the Telugu box
      And the CMS does not fill in the Telugu text for me

    @FR-EDIT-04
    Scenario: The tree follows the content hierarchy
      When I open "Ramayana"
      Then the tree shows section › chapter › scene › chunk, and a quiz under each chapter
      And labels are shown in the chosen language, or in English when there is no translation yet

  Rule: Saving the same text again is not a change

    @FR-EDIT-05
    Scenario: Leaving a box without changing it
      Given a chunk has the Telugu text "అతను దయగల, న్యాయమైన రాజు."
      When I save the Telugu text "అతను దయగల, న్యాయమైన రాజు." again
      Then nothing is saved
      And no audio is marked out of date
      And nothing is added to the activity log

  Rule: Editing an approved item needs a new review

    @FR-EDIT-06
    Scenario: Approval is cleared by an edit
      Given "Book of Datta" is approved
      When I change any text in "Book of Datta"
      Then "Book of Datta" goes back to draft
      And the activity log says "Approval cleared"
