const db = require('../../config/db');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const auth = require('../../config/auth.js');

const reset_database = path.join(__dirname, '../../database/create_database.sql');
const sql_data = path.join(__dirname, '../../database/sql_data.sql');
const picturePath = path.join(__dirname, '../../uploads');

exports.createUser = function(values, done) {
    db.get_pool().query('INSERT INTO auction_user ' +
        '(user_username, user_givenname, user_familyname, user_email, user_password) ' +
        'VALUES (?, ?, ?, ?, ?)', values,
        function(err, result) {
            if(err) return done(400);
            done(result);
        });
};

exports.getUser = function(id, token, done) {

    let loginQuery = "SELECT user_id FROM auction_user WHERE user_token = ?";
    db.get_pool().query(loginQuery, token, function(err, rowss) {
        if (err || rowss.length === 0) {

            db.get_pool().query('SELECT * FROM auction_user WHERE user_id = ?', id,
                function (err, rows) {
                    if (err) return done(404);
                    if (rows.length > 0) {


                        return done({
                            "username": rows[0].user_username,
                            "givenName": rows[0].user_givenname,
                            "familyName": rows[0].user_familyname
                        });
                    } else {
                        return done(404);
                    }
                });

        } else {

            let userId = rowss[0].user_id;

            if(userId.toString() === id) {

                db.get_pool().query('SELECT * FROM auction_user WHERE user_id = ?', id,
                    function (err, rows) {
                        if (err) return done(404);
                        if (rows.length > 0) {


                            return done({
                                "username": rows[0].user_username,
                                "givenName": rows[0].user_givenname,
                                "familyName": rows[0].user_familyname,
                                "email": rows[0].user_email,
                                "accountBalance": rows[0].user_accountbalance
                            });
                        } else {
                            return done(404);
                        }
                    });

            } else {
                db.get_pool().query('SELECT * FROM auction_user WHERE user_id = ?', id,
                    function (err, rows) {
                        if (err) return done(404);
                        if (rows.length > 0) {


                            return done({
                                "userName": rows[0].user_username,
                                "givenName": rows[0].user_givenname,
                                "familyName": rows[0].user_familyname
                            });
                        } else {
                            return done(404);
                        }
                    });





            }
        }
    })
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

exports.userLogin = function(auth, pass, type, done) {

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
