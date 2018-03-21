# Assumptions for SENG365
## sbo49 - 14560776

The purpose of this document is to outline the assumptions I have made with regards to
the API specification.

1. Under GET /auctions/{id}, a 400 Bad Request is given as an error code we are required to implement.
Normally if we received malformed JSON we would send a 400 error, however since no request body is 
passed for this request we cannot do this. To ensure I have followed the spec I have decided to return a 400
error if the id passed as a parameter is not an integer i.e /auctions/xef or /auctions/+3e".
This is now also true for PATCH /auctions/{id}, and GET+POST /auctions/{id}/bids.

2. Assume more than one user can be logged in at a time. This would be the case when people are accessing
the login server from different computers. Because of this, the user_token field may contain entries in more than one 
user row. However, one user can only be logged in on one machine at a time, so the latest login attempt would be the 
current session.

3. Under PATCH /auctions/{id}, there is a 403 error for when bidding has begun on the auction. During the final help session
it was said that an auction can not be update once the starting date has passed, so I have implemented this to return the 403 
error for the sake of the API specifications completeness. It could possibly send a 400 error, however then there would be no
place to send a 403 error as obviously the auction cannot be updated after a bid has been placed.