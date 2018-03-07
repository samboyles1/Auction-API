//Tip
//node validator package for dates
//validate for things that is consistent with the db

const db = require('./config/db'),
    express = require('./config/express');

const app = express();

//Connect to mySQL
db.connect(function(err) {
    if (err) {
        console.log('Unable to connect to SQL');
        process.exit(1);
    } else {
        app.listen(4941, function() {
            console.log('Listening on port: ' + 4941);
        });
    }
});
