@P2 @J7
Feature: Bedtime stories
  A bedtime story is scenes and chunks, with a cover, themes and characters. It has no quiz.

  Background:
    Given I am signed in as a Content Manager
    And I am on staging

  @FR-STORY-01
  Scenario: Add a new bedtime story
    When I press "New bedtime story" in the library
    Then a dialog asks for the title
    When I enter the title "The Owl" and press Enter
    Then a new draft story "The Owl" is created with one scene and one empty chunk
    And it is switched off
    And it opens in the editor
    And the activity log says "Created bedtime story"

  @FR-STORY-06
  Scenario: The title is required, and cancelling creates nothing
    When I press "New bedtime story" in the library
    And I submit an empty title
    Then the Title field says "Enter a title for the story."
    When I press Escape or "Cancel"
    Then no story is created

  @FR-STORY-07
  Scenario: Delete a draft that never reached production
    Given "The Clever Crow" is a draft that has never been promoted
    When I press "Delete draft" in the editor and confirm
    Then it is removed from staging
    And the activity log says "Deleted draft"
    And I am back in the library

  @FR-STORY-08
  Scenario: Only an unpromoted draft can be deleted
    Then "Delete draft" is disabled with the reason "Only a draft can be deleted" for an item in review or approved
    And it is disabled with the reason "It is in production, so it cannot be deleted" for anything that exists in production
    And it is disabled for a Support Lead and in production

  @FR-STORY-02
  Scenario: Fill in the story
    Given I created a new bedtime story
    When I enter a title, description and cover
    And I pick the themes "Kindness" and "Friendship"
    And I pick the characters "Deer" and "Hunter"
    And I add a scene and chunks, with audio for each required voice
    Then the story passes validation

  @FR-STORY-03
  Scenario: A story needs a cover, a theme, a character and a scene
    Given "The Clever Crow" has no cover image and no characters
    When I validate it
    Then I see the errors "Cover image missing" and "Needs at least one character"

  @FR-STORY-04
  Scenario: Story media lives under the bedtime stories folder
    Then the media folder for story 1, scene 1, chunk 1 is "content_media/bedtime_stories/stories/1/scenes/1/chunks/1/"

  @FR-STORY-05
  Scenario: Stories follow the same rules as epics
    Then a story is edited on staging only
    And a text change marks its audio out of date
    And it goes through review and promote, and lands switched off
