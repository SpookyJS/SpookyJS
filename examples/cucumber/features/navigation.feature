Feature: Navigation
    As a SpookyJS user
    I would like to use the navigation API

    Scenario: Back
        Given I go to "/1.html"
          And I go to "/2.html"
          And I go to "/3.html"
         When I go back
         Then I should be on "2\.html"
          And run

    Scenario: Forward
        Given I go to "/1.html"
          And I go to "/2.html"
          And I go to "/3.html"
          And I go back
         When I go forward
         Then I should be on "3\.html"
          And run
