const User = require('../models/auction.server.model');
const fs = require('fs');
const path = require('path');



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
