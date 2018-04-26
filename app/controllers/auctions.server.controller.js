const Auction = require('../models/auctions.server.model');

exports.create_auction = function(req, res) {


    if(!(req.body.categoryId && req.body.title && req.body.description && req.body.startDateTime && req.body.endDateTime && req.body.reservePrice && req.body.startingBid)) {
        res.statusMessage = "Bad request.";
        res.sendStatus(400).end();
    } else {
        Auction.getIdFromToken(req.get('X-Authorization'), function (id) {
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

            if (startTime > endTime) {
                res.sendStatus(400).end()
            } else {

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

                Auction.createAuction(values, function (result) {
                    if (result['id']) {
                        res.statusMessage = "OK";
                        res.status(201);
                        res.json(result);
                    } else {
                        res.sendStatus(result);
                    }
                });
            }

        })

    }

};

exports.update_auction = function(req, res) {
    try {
        let token = req.get('X-Authorization');

        let auctionId = req.params.id;
        let params = req.body;
        let str = "";
        for (let i in params) {
            let string = (i + ' = "' + params[i] + '",');
            str = str.concat(string);
        }
        str = str.substring(0, str.length - 1);

        Auction.updateAuction(auctionId, str, token, function (result) {

            if (result === 201) {
                res.statusMessage = "OK";
                res.status(result).send("OK");
            } else if (result === 403) {
                res.statusMessage = "Forbidden";
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

    Auction.getAuctions(startIndex, count, q, category_id, seller, bidder, winner, function(result) {

        if (result === 400 || result === 401 || result === 404 || result === 500) {
            res.sendStatus(result);
        } else res.json(result);
    });
};

exports.get_one_auction = function(req, res) {
    let id = req.params.id;

    Auction.getOneAuction(id, function(result){
        if (result === 400 || result === 401 || result === 404 || result === 500){
            res.sendStatus(result);
        } else res.json(result);
    });
};

exports.get_bids = function(req, res) {
    let id = req.params.id;

    Auction.getBids(id, function(result) {
        if (result === 400 || result === 404 || result === 500) {
            res.sendStatus(result);
        } else res.json(result);
    });
};

exports.place_bid = function(req, res) {


    let bid_data = {
        "amount":req.body.amount,
        "id":req.params.id
    };
    let amount = bid_data['amount'].toString();
    let id = bid_data['id'].toString();
    let token = req.get('X-Authorization');

    Auction.placeBid(amount, id, token, function(result){
        if (result === 201) {
            res.statusMessage= "OK";
            res.status(result).send("OK");
        } else res.sendStatus(result);
    });



};

exports.get_photos = function(req, res) {
    let auctionId = req.params.id;
    Auction.getPhoto(auctionId, function(result){
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

    Auction.addPhoto(auctionId, token, req, function(result){
        if (result === 201) {
            res.statusMessage = "OK";
            res.status(result).send("OK");
        } else {
            res.sendStatus(result);
        }
    });
};

exports.delete_photo = function(req, res) {
    let id = req.params.id;
    let token = req.get('X-Authorization');

    Auction.deletePhoto(id, token, function(result){
        if (result === 201) {
            res.statusMessage = "OK";
            res.status(result).send("OK");
        } else {
            res.sendStatus(result);
        }
    });
};