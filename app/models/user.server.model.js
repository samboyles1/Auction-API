const db = require('../../config/db');


exports.insert = function(values, done){
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



