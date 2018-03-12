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
            if(err) return done(err);
            done(result);
        });
};

exports.getUser = function(id, done) {
    db.get_pool().query('SELECT * FROM auction_user WHERE user_id = ?', id,
        function(err, rows){
            if(err) return done(err);
            done(rows);
        });
};
//TODO complete update
exports.updateUser = function(done) {
    null;
}
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
                return done({"ERROR":"Invalid username/email/password supplied"});
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
            };
        });

    } else if (type === 2) {
        db.get_pool().query('SELECT * FROM auction_user WHERE user_email = ? and user_password = ?', [auth, pass], function(err, rows) {
            if (err) {
                return done({"ERROR": "Invalid username/email/password supplied"});
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
            };
        });
    };
};

exports.userLogout = function(token, done) {

    let query = "UPDATE auction_user SET user_token = NULL WHERE user_id = ?";
    db.get_pool().query(query, token, function(err, rows) {
        if (err) return done({"ERROR":"Unauthorized"});
            done(rows);
        });
};

exports.reset_server = function(done) {

    fs.readFile(reset_database, {encoding: 'utf-8'}, function (err, data) {
        if (!err) {
            db.get_pool().query(data, function (err, rows) {
                if (err) return done({"ERROR": "Malformed request."});
                done('OK');
            });
        } else {
            return done({"ERROR":"Malformed request."});
        }
    });
};

exports.repopulate_db = function(done) {
    fs.readFile(sql_data, {encoding: 'utf-8'}, function (err, data) {
        if (!err) {
            db.get_pool().query(data, function (err, rows) {
                if (err) return done({"ERROR": "Malformed request."});
                done('OK');
            });
        } else {
            return done({"ERROR":"Malformed request."});
        }
    });
};
//TODO error responses
exports.createAuction = function(values, done) {


    db.get_pool().query("INSERT INTO auction " +
        "(auction_categoryid, auction_title, auction_description, auction_startingdate, auction_endingdate, auction_reserveprice, auction_startingprice, auction_userid) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)", values, function(err, result) {
            if(err) return done("Malformed auction data");
            let auction_id = result.insertId;
            done({
                "id":auction_id
            });
        });

};

exports.getAuctions = function(done) {
    db.get_pool().query('SELECT * FROM auction ORDER BY auction_startingdate DESC', function(err, rows){
            if(err) return done(err);
            done(rows);
        });
};
//TODO return correct json
exports.getOneAuction = function(id, done) {
    db.get_pool().query("SELECT * FROM auction WHERE auction_id = ?", id, function(err, rows) {
        if (err) return done("Not found");
        done(rows);
    });
};

exports.getBids = function(id, done) {
    db.get_pool().query("SELECT bid.bid_amount AS amount, bid.bid_datetime AS datetime, bid.bid_userid AS buyerId, " +
        "auction_user.user_username AS buyerUsername FROM bid, auction_user " +
        "WHERE bid_auctionid = ? AND bid.bid_userid = auction_user.user_id", id, function(err, rows) {
        if (err) return done("Not found");
        if (rows.length > 0) {
            done(rows);
        } else {
            return done("Not found");
        }
    });
};