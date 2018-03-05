const db = require('./config/db'),
    express = require('./config/express');

const app = express();

//Connect to mySQL
db.connect(function(err) {
    if (err) {
        console.log('Unable to connect to SQL');
        process.exit(1);
    } else {
        app.listen(3000, function() {
            console.log('Listening on port: ' + 3000);
        });
    }
});
