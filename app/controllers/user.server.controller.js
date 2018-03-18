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
                res.send(result, "Malformed request");
            } else {
                res.status(201);
                res.json({
                    "id": result['insertId']
                });
            }


        });
    } catch (err) {
        res.sendStatus(400);
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
                res.status(result).send("OK");

            } else {
                res.status(result).send("Unauthorized");
            }
        });
    } catch (err) {
        res.sendStatus(401);
    }
};

exports.login = function(req, res) {

    let user_data = {
        "username": req.query.username,
        "email": req.query.email,
        "password": req.query.password
    }

    if (user_data['username'] !== undefined) {
        let user = user_data['username'].toString();
        let password = user_data['password'].toString();
        User.userLogin(user, password, 1, function(result){
            if(result === 400) {
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
                res.status(result).send("Invalid username/email/password supplied")
            } else {
                res.json(result);
            }
        });

    } else {
        res.status(400);
        res.send("Invalid username/email/password supplied");
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
            res.status(result).send("Sample of data has been reloaded.")
        } else {
            res.sendStatus(result);
        }
    });
};

exports.create_auction = function(req, res) {

    try {
        User.getIdFromToken(req.get('X-Authorization'), function(id) {
            let auction_data = {
                "categoryId":req.body.categoryId,
                "title":req.body.title,
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
            let endTime= auction_data['endDateTime'].toString();
            let reserve = auction_data['reservePrice'].toString();
            let startBid = auction_data['startingBid'].toString();
            let userId = auction_data['user_id'].toString();
            console.log(userId);
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

            User.createAuction(values, function(result) {
                if (result['id']) {
                    res.json(result);
                } else {
                    res.sendStatus(result);
                }
            });

        })
    } catch (err) {
        res.sendStatus(400);
    }
};

exports.update_auction = function(req, res) {
    try {
        let id = req.params.id;
        let params = req.body;
        let str = "";
        for (let i in params) {
            let string = (i + ' = "' + params[i] + '",');
            str = str.concat(string);
        }
        str = str.substring(0, str.length - 1);

        User.updateAuction(id, str, function (result) {

            if (result === 201) {
                return res.status(result).send('OK');
            } else if (result === 403) {
                return res.status(result).send("Forbidden - bidding has begun on the auction.")
            } else if (result === 404) {
                return res.status(result).send('Not found.');
            } else res.sendStatus(result);

        });
    } catch (err) {
        res.sendStatus(400);
    }
};
//offset in sql for startindex
//use startdate
//use %like%
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
//SEnd image as binary object through postman
//only one image per auction
//create /uploads or /photos repo in directory with id of auction i.e 1.png
//fields will still be in auction db, dont have to use them
//GET will work by going to /uploads/1.png for auction 1
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
