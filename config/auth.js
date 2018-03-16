const config = require('../config/express.js');
const users = require('../app/models/user.server.model');

const isAuthenticated = (req, res, next) =>{
    let token = req.get('X-Authorization');
    users.getIdFromToken(token, function(id, err) {
        if(err || id === null) {
            return res.sendStatus(401);
        }
        next();
    });
};

module.exports = {
    isAuthenticated: isAuthenticated
};