const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
var app = express();
app.use(bodyParser.json());

const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'mysql3.csse.canterbury.ac.nz',
    user: 'sbo49',
    password: '14560776',
    database: 'sbo49'
});

function reset_database(req, res) {
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.json({"ERROR": "Error in connection database"})
        }

        console.log('connected as id ' + connection.threadId);

        var contents = fs.readFileSync("create_database.sql").toString();

        /*
        var contents;
        var fs = require('fs');
        fs.readFileSync('create_database.sql', 'utf8', function (err, contents) {
            //console.log(contents);

        });
        */
        //contents = contents.replace(/\n/g, '');
        console.log(contents);
        connection.query(contents, function (err, result) {
            connection.release();
            if (err) {
                console.log(err);
            }
            console.log("Database reset");
        });

        connection.on('error', function (err) {
            res.json({"ERROR": "Error in connection database"});
            return;
        });

    });
}


/* Force reset of database to original structure */
app.post('/reset', function (req, res) {
    reset_database(res, req);
});

app.get('/', function (req, res) {
    res.send({"message": "Hello World!"})
});

app.listen(4941, function () {
    console.log('Example app listening on container port 4941!')
})


reset_database();