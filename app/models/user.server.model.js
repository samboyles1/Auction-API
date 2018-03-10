const db = require('../../config/db');
const path = require('path');
const fs = require('fs');

const reset_database = path.join(__dirname, '../../database/create_database.sql');
const sql_data = path.join(__dirname, '../../database/sql_data.sql');

exports.createUser = function(values, done){
    db.get_pool().query('INSERT INTO auction_user ' +
        '(user_username, user_givenname, user_familyname, user_email, user_password) ' +
        'VALUES (?, ?, ?, ?, ?)', values,
        function(err, result) {
            if(err) return done(err);
            done(result);
        });
};

exports.getUser = function(id, done){
    db.get_pool().query('SELECT * FROM auction_user WHERE user_id = ?', id,
        function(err, rows){
            if(err) return done(err);
            done(rows);
        });
};
/*
Logs the user into the website
@param auth The email/username supplied by the user
@param pass The password supplied by the user
@param type Defines whether a username or email has been provided. 1 = Username, 2 = Email
*/
exports.userLogin = function(auth, pass, type, done) {
    if (type == 1) {
        db.get_pool().query('SELECT * FROM auction_user WHERE user_username = ? and user_password = ?', [auth, pass], function(err, rows) {
            if (err) {
                return done({"ERROR":"Invalid username/email/password supplied"});
            }
            done(rows);
        });
    } else if (type == 2) {
        db.get_pool().query('SELECT * FROM auction_user WHERE user_email = ? and user_password = ?', [auth, pass], function(err, rows) {
            if (err) return done({"ERROR":"Invalid username/email/password supplied"});
            done(rows);
        });
    }
};

exports.reset_server = function(done){
    let query = fs.readFileSync(reset_database, 'utf8');
    console.log(query);
    db.get_pool().query(query, function(err, rows){
        if(err) {
            return done({"ERROR": "Cannot reset database"});
        };
        done(rows);
    });
};

exports.repopulate_db = function(done){
    let query = fs.readFileSync(sql_data, 'utf8');
    console.log(query);
    db.get_pool(query, function(err, rows){
        if(err) {
            return done({"ERROR":"Cannot resample database"});
        };
        done(rows);
    });
};

exports.createAuction = function(done) {
};

exports.getAuctions = function(done){
    db.get_pool().query('SELECT * FROM auction', function(err, rows){
            if(err) return done(err);
            done(rows);
        });
};