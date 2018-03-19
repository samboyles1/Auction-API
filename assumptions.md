# Assumptions for SENG365
## sbo49 - 14560776

The purpose of this document is to outline the assumptions I have made with regards to
the API specification.

1. Under GET /auctions/{id}, a 400 Bad Request is given as an error code we are required to implement.
Normally if we received malformed JSON we would send a 400 error, however since no request body is 
passed for this request we cannot do this. To ensure I have followed the spec I have decided to return a 400
error if the id passed as a parameter is not an integer i.e /auctions/xef or /auctions/+3e".