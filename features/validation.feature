@P1 @J5
Feature: Validation
  Validation lists errors and warnings per language.
  Errors block approve, promote and switching on. Warnings do not.

  @FR-VAL-01
  Scenario: Validate an item
    Given I open "Ramayana"
    When I press "Validate"
    Then I see a list of errors and warnings, grouped by language

  @FR-VAL-02
  Scenario: Planted Telugu problems are found
    When I validate "Ramayana"
    Then I see these Telugu issues
      | where                                             | level   | message                                  |
      | The King of Ayodhya › Scene 2 › Chunk 2            | error   | Male voice: audio missing                |
      | Rama and Sage Vishwamitra › Scene 1 › Chunk 1      | error   | Female voice: out of date, the text changed |
      | Rama and Sage Vishwamitra › Scene 1 › Chunk 2      | warning | Child voice: audio missing               |
      | Rama Leaves for the Forest › Scene 1 › Chunk 2     | error   | Text missing                             |
    And English has no errors

  @FR-VAL-03
  Scenario: Click an error to jump to it
    Given the validation panel shows "Male voice: audio missing"
    When I click it
    Then the editor opens that chunk in Telugu

  @FR-VAL-04
  Scenario: A language that has not started is one warning
    Given "Bhagavad Gita lessons" has no Telugu text at all
    When I validate it
    Then Telugu shows one warning "Telugu not started"
    And Telugu shows no errors

  @FR-VAL-05
  Scenario: Problems that are the same in every language are shown once
    Given "The Clever Crow" has no cover image, no characters and no landscape image
    When I validate it
    Then the errors "Cover image missing", "Needs at least one character" and "Landscape image missing" are shown under English only

  @FR-VAL-06
  Scenario Outline: Required and optional voices
    Given a chunk has text in <language>
    And its <voice> audio is <state>
    When I validate
    Then I see a <level>

    Examples:
      | language | voice  | state   | level   |
      | Telugu   | female | missing | error   |
      | Telugu   | male   | draft   | error   |
      | Telugu   | female | stale   | error   |
      | Telugu   | child  | missing | warning |

  @FR-VAL-07
  Scenario: A fully translated item passes
    When I validate "Book of Datta"
    Then there are no errors in any language
