Feature: Error handling and propogation
    As a user of spooky
    I want to be notified when an error occurs locally or remotely
    So that I can fix it

    # Setup phase

    Scenario: Invalid argument to remote method
        When I call "then" with "not a function, bro"
        Then Spooky should raise an error

    Scenario: Error during remote method execution
        When I call "then" with "function () { throw new Error('OHNOES'); }"
         And I run spooky
        Then Spooky should raise an error
