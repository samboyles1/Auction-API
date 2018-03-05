const db = require('../../config/db');


exports.insert = function(values, done){
    let values1 = [values];
    console.log(values1);
    db.get_pool().query('INSERT INTO auction_user ' +
        '(user_username, user_givenname, user_familyname, user_email, user_password) ' +
        'VALUES (?, ?, ?, ?, ?)', values,
        function(err, result) {
            if(err) return done(err);
            done(result);
        });
};



