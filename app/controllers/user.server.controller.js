const User = require('../models/user.server.model');
const fs = require('fs');
const path = require('path');

exports.create_user = function(req, res) {

    try {
        let user_data = {
            "username": req.body.username,
            "givenName": req.body.givenName,
            "familyName": req.body.familyName,
            "email": req.body.email,
            "password": req.body.password
        };

        let user = user_data['username'].toString();
        let given = user_data['givenName'].toString();
        let family = user_data['familyName'].toString();
        let email = user_data['email'].toString();
        let password = user_data['password'].toString();

        let values = [
                [user],
                [given],
                [family],
                [email],
                [password]
            ]
        ;

        User.createUser(values, function (result) {
            if (result === 400) {
                res.statusMessage = "Malformed request";
                res.status(result).send("Malformed request");
            } else {
                res.statusMessage = "OK";
                res.status(201);
                res.json({
                    "id": result['insertId']
                });
            }


        });
    } catch (err) {
        res.statusMessage = "Malformed request";
        res.status(400).send("Malformed request");
    }
};

exports.get_user = function(req, res) {
    let id = req.params.userId;
    let token = req.get('X-Authorization');


    User.getUser(id, token, function(result){
        if (result === 404) {
            res.sendStatus(404);
        } else {
            res.json(result);
        }

    });
};

exports.update_user = function(req, res) {

    try {
        let id = req.params.userId;
        let params = req.body;
        let str = "";
        for (let i in params) {
            let string = (i + ' = "' + params[i] + '",');
            str = str.concat(string);
        }
        str = str.substring(0, str.length - 1);

        User.updateUser(id, str, function (result) {
            if (result === 201) {
                res.statusMessage = "OK";
                res.status(result).send("OK");

            } else {
                res.statusMessage = "Unauthorized";
                res.status(result).send("Unauthorized");
            }
        });
    } catch (err) {
        res.statusMessage = "Unauthorized";
        res.status(401).send("Unauthorized");
    }
};

exports.login = function(req, res) {

    let user_data = {
        "username": req.query.username,
        "email": req.query.email,
        "password": req.query.password
    };

    if(req.query.password === undefined) {
        res.statusMessage = "Invalid username/email/password supplied";
        res.status(400).send("Invalid username/email/password supplied");
    }

    if (user_data['username'] !== undefined) {
        let user = user_data['username'].toString();
        let password = user_data['password'].toString();
        User.userLogin(user, password, 1, function(result){
            if(result === 400) {
                res.statusMessage = "Invalid username/email/password supplied";
                res.status(result).send("Invalid username/email/password supplied")
            } else {
                res.json(result);
            }


        });
    } else if (user_data['email'] !== undefined) {
        let email = user_data['email'].toString();
        let password = user_data['password'].toString();

        User.userLogin(email, password, 2, function(result){
            if(result === 400) {
                res.statusMessage = "Invalid username/email/password supplied";
                res.status(result).send("Invalid username/email/password supplied")
            } else {
                res.json(result);
            }
        });

    } else {
        res.statusMessage = "Invalid username/email/password supplied";
        res.status(400).send("Invalid username/email/password supplied");
    };
};

exports.logout = function(req, res){
    let token = req.get('X-Authorization');
    User.userLogout(token, function(result){
        res.sendStatus(result);

    });
};

exports.reset = function(req, res) {
    User.reset_server(function(result){
        res.sendStatus(result);
    });
};

exports.resample = function(req, res) {
    User.repopulate_db(function(result) {
        if (result === 201) {
            res.statusMessage = "Sample of data has been reloaded.";
            res.status(result).send("Sample of data has been reloaded.")
        } else {
            res.sendStatus(result);
        }
    });
};

exports.create_auction = function(req, res) {

    if(!(req.body.categoryId && req.body.title && req.body.description && req.body.startDateTime && req.body.endDateTime && req.body.reservePrice && req.body.startingBid)) {
        res.statusMessage = "Bad request.";
        res.sendStatus(400).end();
    } else {
        User.getIdFromToken(req.get('X-Authorization'), function (id) {
            let auction_data = {
                "categoryId": req.body.categoryId,
                "title": req.body.title,
                "description": req.body.description,
                "startDateTime": req.body.startDateTime,
                "endDateTime": req.body.endDateTime,
                "reservePrice": req.body.reservePrice,
                "startingBid": req.body.startingBid,
                "user_id": id
            };
            let category = auction_data['categoryId'].toString();
            let title = auction_data['title'].toString();
            let description = auction_data['description'].toString();
            let startTime = auction_data['startDateTime'].toString();
            let endTime = auction_data['endDateTime'].toString();
            let reserve = auction_data['reservePrice'].toString();
            let startBid = auction_data['startingBid'].toString();
            let userId = auction_data['user_id'].toString();

            let values = [
                [category],
                [title],
                [description],
                [startTime],
                [endTime],
                [reserve],
                [startBid],
                [userId]
            ];

            User.createAuction(values, function (result) {
                if (result['id']) {
                    res.statusMessage = "OK";
                    res.status(201);
                    res.json(result);
                } else {
                    res.sendStatus(result);
                }
            });

        })

    }

};
//TODO allows people to update auctions that arent their own currently
exports.update_auction = function(req, res) {
    try {
        let auctionId = req.params.id;
        let params = req.body;
        let str = "";
        for (let i in params) {
            let string = (i + ' = "' + params[i] + '",');
            str = str.concat(string);
        }
        str = str.substring(0, str.length - 1);

        User.updateAuction(auctionId, str, function (result) {

            if (result === 201) {
                res.statusMessage = "OK";
                res.status(result).send("OK");
            } else if (result === 403) {
                res.statusMessage = "Forbidden - bidding has begun on the auction.";
                res.status(result).send("Forbidden - bidding has begun on the auction.");
            } else if (result === 404) {
                res.statusMessage = "Not found.";
                res.status(result).send("Not found.");
            } else res.sendStatus(result);

        });
    } catch (err) {
        res.sendStatus(400);
    }
};

exports.view_auctions = function(req, res) {
    let startIndex = req.query.startIndex;
    let count = req.query.count;
    let q = req.query.q;
    let category_id = req.query["category-id"];
    let seller = req.query.seller;
    let bidder = req.query.bidder;
    let winner = req.query.winner;

    User.getAuctions(startIndex, count, q, category_id, seller, bidder, winner, function(result) {

        if (result === 400 || result === 401 || result === 404 || result === 500) {
            res.sendStatus(result);
        } else res.json(result);
    });
};

exports.get_one_auction = function(req, res) {
    let id = req.params.id;

    User.getOneAuction(id, function(result){
        if (result === 400 || result === 401 || result === 404 || result === 500){
            res.sendStatus(result);
        } else res.json(result);
    });
};

exports.get_bids = function(req, res) {
    let id = req.params.id;
    User.getBids(id, function(result) {
        if (result === 400 || result === 404 || result === 500) {
            res.sendStatus(result);
        } else res.json(result);
    });
};

exports.place_bid = function(req, res) {

    try {
        let bid_data = {
            "amount":req.body.amount,
            "id":req.params.id
        };
        let amount = bid_data['amount'].toString();
        let id = bid_data['id'].toString();
        let token = req.get('X-Authorization');

        User.placeBid(amount, id, token, function(result){
            if (result === 201) {
                res.status(result).send("OK");
            } else res.sendStatus(result);
        });
    } catch (err) {
        res.sendStatus(400);
    }


};

exports.get_photos = function(req, res) {
    let auctionId = req.params.id;
    User.getPhoto(auctionId, function(result){
        if (result === 200 || result === 400 || result === 404 || result === 500){
            res.sendStatus(result);
        } else {
            res.send(result);
        }
    });
};

exports.add_photo = function(req, res) {
    let auctionId = req.params.id;
    let token = req.get('X-Authorization');

    User.addPhoto(auctionId, token, req, function(result){
        if (result === 201) {
            res.status(result).send("OK").end();
        } else {
            res.sendStatus(result);
        }
    });
};

exports.delete_photo = function(req, res) {
    let id = req.params.id;
    User.deletePhoto(id, function(result){
        if (result === 201) {
            res.status(result).send("OK");
        } else {
            res.sendStatus(result);
        }
        });
};
