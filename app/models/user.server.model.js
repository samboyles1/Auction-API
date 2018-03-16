//TODO all error codes
//todo login function has error codes work

const db = require('../../config/db');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const reset_database = path.join(__dirname, '../../database/create_database.sql');
const sql_data = path.join(__dirname, '../../database/sql_data.sql');

exports.createUser = function(values, done) {
    db.get_pool().query('INSERT INTO auction_user ' +
        '(user_username, user_givenname, user_familyname, user_email, user_password) ' +
        'VALUES (?, ?, ?, ?, ?)', values,
        function(err, result) {
            if(err) return done(400);
            done(result);
        });
};
//todo return accbal and email if its own user id
exports.getUser = function(id, done) {
    db.get_pool().query('SELECT * FROM auction_user WHERE user_id = ?', id,
        function(err, rows){
            if(err) return done(404);
            console.log(rows.length);
            if (rows.length > 0) {
                return done({
                    "user_id":rows[0].user_id,
                    "user_username":rows[0].user_username,
                    "user_givenname":rows[0].user_givenname,
                    "user_familyname":rows[0].user_familyname
                });
            } else {
                return done(404);
            }
        });
};

exports.updateUser = function(id, values, done) {
    let query = "UPDATE auction_user SET " + values + " WHERE user_id = ?";
    db.get_pool().query(query, id, function(err, rows){
        if(err) return done(401);
        if (rows.affectedRows === 1){
            done(201)
        } else{
            done(401);
        }

    });
};
/*
Logs the user into the website
@param auth The email/username supplied by the user
@param pass The password supplied by the user
@param type Defines whether a username or email has been provided. 1 = Username, 2 = Email
*/
exports.userLogin = function(auth, pass, type, done) {
    /*
    if (type === 1) {
        let query = 'SELECT * FROM auction_user where user_username = ? and user_password = ?';
    } else if (type === 2) {
        let query = 'SELECT * FROM auction_user where user_email = ? and user_password = ?';
    }

    db.get_pool().query(query, [auth, pass], function (err, rows) {
        if (err) {
            return done({"ERROR": "Invalid username/email/password supplied"});
        }
        ;

        if (rows.length > 0) {
            let userid = rows[0].user_id;
            let token = rows[0].user_token;

            done({
                "id": userid,
                "token": token
            });
        } else {
            return done({"ERROR": "Invalid username/email/password supplied"});
        }
        ;


    });
};
*/ //Trying to make this more compact

    if (type === 1) {
        db.get_pool().query('SELECT * FROM auction_user WHERE user_username = ? and user_password = ?', [auth, pass], function(err, rows) {
            if (err) {
                return done(400);
            };

            if (rows.length > 0) {
                let userid = rows[0].user_id;
                // Generate unique user token for session and place in database
                let token = crypto.randomBytes(32 * (3 / 4)).toString("base64");
                db.get_pool().query('UPDATE auction_user SET user_token = ? WHERE user_id = ?', [token, userid]);
                done({
                    "id": userid,
                    "token": token
                });
            } else return done(400);
        });

    } else if (type === 2) {
        db.get_pool().query('SELECT * FROM auction_user WHERE user_email = ? and user_password = ?', [auth, pass], function(err, rows) {
            if (err) {
                return done(400);
            }

            if (rows.length > 0) {
                let userid = rows[0].user_id;
                //Generate user token for session and place in database
                let token = crypto.randomBytes(32 * (3 / 4)).toString("base64");
                db.get_pool().query('UPDATE auction_user SET user_token = ? WHERE user_id = ?', [token, userid]);
                done({
                    "id": userid,
                    "token": token
                });
            } else return done(400);
        });
    }
};

exports.userLogout = function(token, done) {

    let query = "UPDATE auction_user SET user_token = NULL WHERE user_token = ?";
    db.get_pool().query(query, token, function(err, rows) {
        if (err) return done(401);
        if (rows.affectedRows === 1){
            done(200)
        } else {
            done(401);
        }
    });
};

exports.reset_server = function(done) {
    fs.readFile(reset_database, {encoding: 'utf-8'}, function (err, data) {
        if (!err) {
            db.get_pool().query(data, function(err, rows){
                if(err) return done(500);
                done(200);
            });
        } else {
            done(400);
        }
    });
};

exports.repopulate_db = function(done) {
    fs.readFile(sql_data, {encoding: 'utf-8'}, function (err, data) {
        if (!err) {
            db.get_pool().query(data, function (err, rows) {
                if (err) return done(500);
                done(201);
            });
        } else {
            return done(400);
        }
    });
};
//TODO error responses Unauthorized 401 403(is it if theyre not logged in?)
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
//TODO error response 401
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
                done(201);
            });
        }
    });



};
//TODO updated api for get auctions, rewrite
exports.getAuctions = function(done) {
    db.get_pool().query('SELECT * FROM auction ORDER BY auction_startingdate DESC', function(err, rows){
            if(err) return done(err);
            done(rows);
        });
};
//TODO list all bid history
//TODO 401 unauthorized
//todo pass x-auth
exports.getOneAuction = function(id, done) {

    let query = "SELECT auction.auction_categoryid AS categoryId, category.category_title AS categoryTitle, auction.auction_title AS title, " +
    "auction.auction_reserveprice AS reservePrice, auction.auction_startingdate AS startDateTime, auction.auction_endingdate AS endDateTime, " +
        "auction.auction_description AS description, auction.auction_creationdate AS creationDateTime, auction.auction_primaryphoto_URI AS photoUris," +
        " auction.auction_userid AS id, auction_user.user_username AS username, MAX(bid.bid_amount) AS currentBid, bid.bid_amount AS amount," +
        " bid.bid_datetime AS datetime, bid.bid_userid AS buyerId, auction_user.user_username AS buyerUsername " +
        "FROM auction LEFT OUTER JOIN auction_user ON auction.auction_userid = auction_user.user_id " +
        "LEFT OUTER JOIN category ON auction.auction_categoryid = category.category_id " +
        "LEFT OUTER JOIN bid ON auction.auction_id = bid.bid_auctionid " +
        "WHERE auction.auction_id = ?";
    db.get_pool().query(query, id, function(err, rows) {
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

        //TODO retrieve entire bid history to display
        /*
        var bids;
        exports.getBids(id, function(bids){
            console.log(bids);
            return (bids);
        });

        console.log(bids);
        */
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
            "photoUris":[
                photoUris
            ],
            "seller":{
                "id":id,
                "username":username
            },
            "currentBid":currentBid,
            "bids":
                [
                    {
                        "amount":amount,
                        "dateTime":dateTime,
                        "buyerId":buyerId,
                        "buyerUsername":buyerUsername
                    }
                ]
        });
    });
};

exports.getBids = function(id, done) {
    db.get_pool().query("SELECT bid.bid_amount AS amount, bid.bid_datetime AS datetime, bid.bid_userid AS buyerId, " +
        "auction_user.user_username AS buyerUsername FROM bid, auction_user " +
        "WHERE bid_auctionid = ? AND bid.bid_userid = auction_user.user_id", id, function(err, rows) {
        if (err) return done(500);
        console.log(rows);
        if (rows.length > 0) {
            done(rows);
        } else {
            return done(404);
        }
    });
};

//TODO implement 400 bad request and checking for if bid is valid
exports.placeBid = function(amount, id, token, done) {
    let query = "INSERT INTO bid (bid_amount, bid_auctionid, bid_userid) VALUES (?, ?, (SELECT user_id FROM auction_user WHERE user_token = ?))";
    db.get_pool().query(query, [amount, id, token], function(err, rows) {
        if (err) return done(500);
        if(rows.affectedRows === 0) {
            return done(404);
        } else done(201);
    });

};
//Todo doesnt work on auction not existing - implement
exports.getPhoto = function(id, done) {
    let query = "SELECT auction_primaryphoto_URI FROM auction WHERE auction_id = ?";
    db.get_pool().query(query, id, function(err, rows) {
        if(err) {
            return done(500);
        } else if (rows === []) { ///todo here
            return done(400);
        } else if(rows[0].auction_primaryphoto_URI === null) {
            return done(404);
        } else return done(rows);
    });
};

exports.addPhoto = function(done) {
    let query = "INSERT INTO photos";
};

exports.deletePhoto = function(done) {

};
//todo not throwing properly
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
}