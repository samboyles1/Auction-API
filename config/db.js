const mysql = require('mysql');

let state = {
    pool: null
};

exports.connect = function(done) {
    state.pool = mysql.createPool({
        host: 'mysql3.csse.canterbury.ac.nz',
        user: 'sbo49',
        password: '14560776',
        database: 'sbo49',
        multipleStatements:true
    });
    done();
};

exports.get_pool = function() {
    return state.pool;
};

