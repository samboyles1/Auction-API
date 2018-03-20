# Assumptions for SENG365
## sbo49 - 14560776

The purpose of this document is to outline the assumptions I have made with regards to
the API specification.

1. Under GET /auctions/{id}, a 400 Bad Request is given as an error code we are required to implement.
Normally if we received malformed JSON we would send a 400 error, however since no request body is 
passed for this request we cannot do this. To ensure I have followed the spec I have decided to return a 400
error if the id passed as a parameter is not an integer i.e /auctions/xef or /auctions/+3e".
This is now also true for PATCH /auctions/{id}, and GET+POST /auctions/{id}/bids.

2. With regards to returned timestamps, I have stuck with returning the times in a format the same as
the format that was provided in the sample data that we had been given. I don't see any reason to convert these times 
to another format, given that they are easily readable in this format. There was some discussion on the forums about
how the timestamps should be returned however everybody seemed to have a different opinion on this.

3. Assume more than one user can be logged in at a time. This would be the case when people are accessing
the login server from different computers. Because of this, the user_token field may contain entries in more than one 
user row. However, one user can only be logged in on one machine at a time, so the latest login attempt would be the 
current session.