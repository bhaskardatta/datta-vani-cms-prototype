@P1 @J4
Feature: Quizzes
  Each chapter of an epic has a quiz. Bedtime stories have no quizzes.

  Background:
    Given I am signed in as a Content Manager
    And I am on staging

  @FR-QUIZ-01
  Scenario: Translate a quiz question into Kannada
    Given I open "Ramayana › The King of Ayodhya › Quiz" in Kannada
    When I edit question 3's text, answer options and hint
    Then the Kannada text is saved

  @FR-QUIZ-02
  Scenario: The correct answer and option order are the same in every language
    Given question 1 has the options "King Dasharatha", "King Janaka", "Ravana" and the answer is option 1
    When I open question 1 in Telugu
    Then I see three Telugu option boxes in the same order
    And the correct answer is still option 1
    And I cannot change the correct answer from the Telugu tab

  @FR-QUIZ-03
  Scenario: Missing quiz text is an error
    Given Kannada has started for "Ramayana"
    And question 3 has no Kannada text and no Kannada answer option
    When I validate "Ramayana"
    Then I see the Kannada errors "Question 3: question text missing" and "Question 3: an answer option is missing"

  @FR-QUIZ-04
  Scenario: A chapter needs a quiz
    Given a chapter has no quiz
    When I validate the epic
    Then I see the error "No quiz linked" under English

  @FR-QUIZ-05
  Scenario Outline: Supported question types
    Then a question can be of type "<type>"

    Examples:
      | type              |
      | Multiple choice   |
      | True or false     |
      | Fill in the blank |
      | Match the pairs   |
      | Anagram           |
