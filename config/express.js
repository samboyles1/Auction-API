const express = require('express'),
    bodyParser = require('body-parser');

module.exports = function(){
    const app = express();
    app.use(bodyParser.json());
    app.use(function(err, req, res, next) {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
            res.sendStatus(400);
        }
    });
    require('../app/routes/user.server.routes.js')(app);
    require('../app/routes/auctions.server.routes.js')(app);
    return app;
};