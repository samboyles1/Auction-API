const db = require('../../config/db');
const path = require('path');
const fs = require('fs');

const picturePath = path.join(__dirname, '../../uploads');

exports.createAuction = function(values, done) {

    db.get_pool().query("INSERT INTO auction " +
        "(auction_categoryid, auction_title, auction_description, auction_startingdate, auction_endingdate, auction_reserveprice, auction_startingprice, auction_userid) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)", values, function(err, result) {
        if(err) return done(500);
        let auction_id = result.insertId;
        done({
            "id":auction_id
        });
    });
};

exports.updateAuction = function(id, values, done) {
    //Check if auction exists and if bidding has started
    db.get_pool().query("SELECT auction.*, COUNT(*) AS num_bids FROM auction, bid WHERE auction.auction_id = ? and auction.auction_id = bid.bid_auctionid", id, function(err, result){
        if(err) {
            return done(500);
        } else if(!result.length) {
            return done(404);
        } else if(result[0].num_bids > 0){
            return done(403);
        } else {

            let query = "UPDATE auction SET " + values + "WHERE auction_id = ?";
            db.get_pool().query(query, id, function(err, rows){
                if (err) return done(500);
                if (rows.affectedRows === 0) {
                    return done(404);
                }
                done(201);
            });
        }
    });



};
//TODO updated api for get auctions, rewrite

//TODO add current bid
exports.getAuctions = function(startIndex, count, q, category_id, seller, bidder, winner, done) {
    let firstParam = false;
    let query = "SELECT auction.auction_id AS id, category.category_title AS categoryTitle, auction.auction_categoryid AS categoryId, auction.auction_title AS title, " +
        "auction.auction_reserveprice AS reservePrice, auction.auction_startingdate AS startDateTime, auction.auction_endingdate AS endDateTime, " +
        "MAX(bid.bid_amount) AS currentBid " +
        "FROM auction " +
        "LEFT OUTER JOIN auction_user ON auction.auction_userid = auction_user.user_id " +
        "LEFT OUTER JOIN category ON auction.auction_categoryid = category.category_id " +
        "LEFT OUTER JOIN bid ON auction.auction_id = bid.bid_auctionid ";


    if (q !== undefined) {
        if (!firstParam) {
            query += " WHERE auction.auction_title LIKE '%" + q + "%' ";
            firstParam = true;
        } else {
            query += " AND auction.auction_title LIKE '%" + q + "%' ";
        }
    }
    if (category_id !== undefined) {
        if (!firstParam) {
            query += " WHERE category.category_id = " + category_id;
            firstParam = true;
        } else {
            query += " AND category.category_id = " + category_id;
        }
    }
    if (seller !== undefined) {
        if (!firstParam) {
            query += " WHERE auction.auction_userid = " + seller;
            firstParam = true;
        } else {
            query += " AND auction.auction_userid = " + seller;
        }
    }
    //not yet
    if (bidder !== undefined) {
        if (!firstParam) {
            query += " WHERE auction.auction_id IN (SELECT bid_auctionid FROM bid WHERE bid_userid = " + bidder + ") ";
            firstParam = true;
        } else {
            query += " AND auction.auction_id IN (SELECT bid_auctionid FROM bid WHERE bid_userid = " + bidder + ") ";
        }
    }

    query += " GROUP BY auction.auction_id ORDER BY auction.auction_id ASC ";

    if (startIndex !== undefined && count !== undefined) {
        query += "LIMIT " + count + " OFFSET " + startIndex;
    } else if (startIndex !== undefined) {

        //TODO this limit not working properly/doesnt seem right

        query += "LIMIT " + startIndex + " OFFSET " + startIndex;
    } else if (count !== undefined) {
        query += "LIMIT " + count;
    }

    db.get_pool().query(query, function(err, rows){
        if(err) {

            return done(500);
        }

        done(rows);
    });
};

//TODO 400 bad req
exports.getOneAuction = function(auctionId ,done) {

    let query = "SELECT auction.auction_categoryid AS categoryId, category.category_title AS categoryTitle, auction.auction_title AS title, " +
        "auction.auction_reserveprice AS reservePrice, auction.auction_startingdate AS startDateTime, auction.auction_endingdate AS endDateTime, " +
        "auction.auction_description AS description, auction.auction_creationdate AS creationDateTime, auction.auction_primaryphoto_URI AS photoUris," +
        " auction.auction_userid AS id, auction_user.user_username AS username, MAX(bid.bid_amount) AS currentBid, bid.bid_amount AS amount," +
        " bid.bid_datetime AS datetime, bid.bid_userid AS buyerId, auction_user.user_username AS buyerUsername " +
        "FROM auction LEFT OUTER JOIN auction_user ON auction.auction_userid = auction_user.user_id " +
        "LEFT OUTER JOIN category ON auction.auction_categoryid = category.category_id " +
        "LEFT OUTER JOIN bid ON auction.auction_id = bid.bid_auctionid " +
        "WHERE auction.auction_id = ?";
    db.get_pool().query(query, auctionId, function(err, rows) {
        if (err) return done(500);
        if (rows[0].categoryId === null) {
            return done(404);
        }

        let categoryId = rows[0].categoryId;
        let categoryTitle = rows[0].categoryTitle;
        let title = rows[0].title;
        let reservePrice = rows[0].reservePrice;
        let startDateTime = rows[0].startDateTime;
        let endDateTime = rows[0].endDateTime;
        let description = rows[0].description;
        let creationDateTime = rows[0].creationDateTime;
        let photoUris = rows[0].photoUris;
        let id = rows[0].id;
        let username = rows[0].username;
        let currentBid = rows[0].currentBid;

        exports.getBids(auctionId, function(bids){
            if (bids === 404){
                bids = null;
            }

            let amount = rows[0].amount;
            let dateTime = rows[0].datetime;
            let buyerId = rows[0].buyerId;
            let buyerUsername = rows[0].buyerUsername;

            return done({
                "categoryId":categoryId,
                "categoryTitle":categoryTitle,
                "title":title,
                "reservePrice":reservePrice,
                "startDateTime":startDateTime,
                "endDateTime":endDateTime,
                "description":description,
                "creationDateTime":creationDateTime,
                "seller":{
                    "id":id,
                    "username":username
                },
                "currentBid":currentBid,
                "bids":
                    [
                        bids
                    ]
            });
        });
    });
};

exports.getBids = function(id, done) {
    db.get_pool().query("SELECT bid.bid_amount AS amount, bid.bid_datetime AS datetime, bid.bid_userid AS buyerId, " +
        "auction_user.user_username AS buyerUsername FROM bid, auction_user " +
        "WHERE bid_auctionid = ? AND bid.bid_userid = auction_user.user_id", id, function(err, rows) {
        if (err) return done(500);
        if (rows.length > 0) {
            done(rows);
        } else {
            return done(404);
        }
    });
};

exports.placeBid = function(amount, id, token, done) {
    /* Get current bid */
    let bidQuery = "SELECT MAX(bid.bid_amount) as max_bid FROM bid WHERE bid_auctionid = ?";
    db.get_pool().query(bidQuery, id, function(err, bidRow) {
        if(err) return done(500);
        let maxBid = bidRow[0].max_bid;
        if (amount <= maxBid) {
            return done(400);
        } else if (maxBid === null) {
            return done(404);
        } else {

            let query = "INSERT INTO bid (bid_amount, bid_auctionid, bid_userid) VALUES (?, ?, (SELECT user_id FROM auction_user WHERE user_token = ?))";
            db.get_pool().query(query, [amount, id, token], function(err, rows) {
                if (err) return done(500);
                if(rows.affectedRows === 0) {
                    return done(404);
                } else done(201);
            });



        }
    });






};


exports.getPhoto = function(auctionId, done) {

    let query = "SELECT * FROM auction WHERE auction_id = ?";
    db.get_pool().query(query, auctionId, function(err, rows) {
        if (err) {
            /*Error in DB */
            return done(500);
        } else if (rows.length === 0) {
            /* Can't find the auction */
            return done(404);
        } else {
            let pictureExt = '/' + auctionId + '.png';
            fs.readFile(picturePath + pictureExt, {encoding: 'binary'}, function (err, data) {
                if (err) return done(404);
                if (data.length === 0) {
                    done(404);
                } else return done(data);

            });
        }
    });

}

exports.addPhoto = function(auctionId, token, req, done) {

    let loginQuery = "SELECT user_id FROM auction_user WHERE user_token = ?";
    db.get_pool().query(loginQuery, token, function(err, rowss) {
        if (err || rowss.length === 0) {
            /* Not valid token */
            return done(400);

        } else {
            let uid_from_token = rowss[0].user_id;

            let query = "SELECT * FROM auction WHERE auction_id = ?";
            db.get_pool().query(query, auctionId, function(err, rows) {
                if (err) {
                    /*Error in DB */
                    return done(500);
                } else if (rows.length === 0) {
                    /* Can't find the auction */
                    return done(404);
                } else if (uid_from_token !== rows[0].auction_userid) {
                    /* Not their auction */
                    return done(400);
                } else {
                    /* Their auction */
                    let filename = '/' + auctionId + '.png';
                    fs.stat(picturePath + filename, function(err, stat){
                        if (err === null) {
                            /* Photo already exists */
                            console.log('photo exists');
                            return done(400);
                        } else if (err.code === 'ENOENT') {
                            /* Photo doesn't already exist */
                            req.pipe(fs.createWriteStream(picturePath + filename));
                            return done(201);
                        } else return done(500);
                    });
                }
            });

        }
    })
};
/* Throws a 401 Unauthorized error if not authenticated, however spec doesn't ask for a 401.  */
exports.deletePhoto = function(auctionId, done) {
    let path = picturePath + '/' + auctionId + '.png';
    fs.stat(path, function (err, stat) {
        if (err === null) {
            /* Photo already exists */
            fs.unlinkSync(path);
            return done(201);
        } else if (err.code === 'ENOENT') {
            return done(404);
        } else return done(500);
    });
};

exports.getIdFromToken = function(token, done) {
    let query = 'SELECT user_id FROM auction_user WHERE user_token = ?';
    db.get_pool().query(query, token, function(err, rows){
        if(err) {
            return done(err);
        } else if(rows[0]){
            let user_id = rows[0].user_id;
            return done(user_id);
        } else return done(err)

    });
};