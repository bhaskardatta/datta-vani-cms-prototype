@P1 @J2 @J3
Feature: Audio and transcripts
  Each chunk has audio and a word-timing transcript per language and per voice (female, male, child).
  Female and male are required. Child is optional.

  Background:
    Given I am signed in as a Content Manager
    And I am on staging

  Rule: Changing the text makes that language's audio out of date

    @FR-AUD-01
    Scenario: Text change marks audio stale
      Given a chunk has approved Telugu audio for female, male and child
      When I change the chunk's Telugu text
      Then the Telugu audio for female, male and child is marked out of date
      And the English and Kannada audio are not changed

    @FR-AUD-02
    Scenario: Missing audio stays missing
      Given a chunk has no Telugu male audio
      When I change the chunk's Telugu text
      Then the Telugu male audio is still missing

    @FR-AUD-03
    Scenario: A draft also goes out of date
      Given a chunk has a Telugu female draft waiting for approval
      When I change the chunk's Telugu text
      Then the Telugu female audio is marked out of date

  Rule: New audio is a draft until someone approves it

    @FR-AUD-04
    Scenario: Regenerate, play and approve
      Given a chunk's Telugu female audio is out of date
      When I press "Regenerate" for the female voice
      Then a draft with audio and a transcript appears
      When I press "Play"
      Then each word is highlighted as it is spoken
      When I press "Approve"
      Then the Telugu female audio is current

    @FR-AUD-05
    Scenario: Upload a recorded file
      When I upload "take2.mp3" for the Telugu male voice
      Then a draft appears with source "uploaded" and file "take2.mp3"
      And a transcript is made from the uploaded audio as a draft
      When I press "Approve"
      Then the Telugu male audio is current and still points to "take2.mp3"

    @FR-AUD-06
    Scenario: Reject puts back what was there before
      Given the Telugu female audio is current and was uploaded as "studio.mp3"
      When I press "Regenerate" for the female voice
      And I press "Reject"
      Then the Telugu female audio is current and still points to "studio.mp3"

    @FR-AUD-07
    Scenario: Reject after two drafts in a row
      Given the Telugu female audio is out of date
      When I press "Regenerate"
      And I upload "b.mp3"
      And I press "Reject"
      Then the Telugu female audio is out of date again

    @FR-AUD-08
    Scenario: Approve needs a draft
      Given the Telugu male audio is missing
      Then I cannot approve it

  Rule: Files live at fixed paths

    @FR-AUD-09
    Scenario Outline: The media path for a voice
      Given the chunk's media folder is "content_media/daily_learnings/books/1/sections/1/chapters/1/scenes/1/chunks/1/"
      Then the <file> for <language> <voice> lives at "<path>"

      Examples:
        | language | voice  | file            | path                                                                                                |
        | English  | female | audio.mp3       | content_media/daily_learnings/books/1/sections/1/chapters/1/scenes/1/chunks/1/body/female/audio.mp3 |
        | Telugu   | male   | transcript.json | content_media/daily_learnings/books/1/sections/1/chapters/1/scenes/1/chunks/1/te/body/male/transcript.json |

  Rule: Transcripts have one entry per word, in order

    @FR-AUD-10
    Scenario: Word timings do not overlap
      When a transcript is made for "Long ago, King Dasharatha ruled"
      Then it has 5 words
      And each word starts after the previous word ends
