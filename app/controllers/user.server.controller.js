const User = require('../models/user.server.model');

exports.list = function(req, res){
    User.getAll(function(result){
        res.json(result);
    });
};

//USERS methods
exports.create = function(req, res){
    let user_data = {
        "username": req.body.username,
        "givenName": req.body.givenName,
        "familyName": req.body.familyName,
        "email": req.body.email,
        "password": req.body.password
    };

    let user = user_data['username'].toString();
    let given = user_data['givenName'].toString();
    let family = user_data['familyName'].toString();
    let email = user_data['email'].toString();
    let password = user_data['password'].toString();

    let values = [
        [user],
        [given],
        [family],
        [email],
        [password]
        ]
    ;

    User.createUser(values, function(result){
        res.json(result);
    });
};

exports.read = function(req, res){
    let id = req.params.userId;
    User.getUser(id, function(result){
        res.json(result);
    });
};

exports.update = function(req, res){
    return null;
};

exports.login = function(req, res){

    let user_data = {
        "username": req.body.username,
        "email": req.body.email,
        "password": req.body.password
    }

    if (user_data['username'] != undefined) {
        let user = user_data['username'].toString();
        let password = user_data['password'].toString();
        User.userLogin(user, password, 1, function(result){

            res.json(result);
        });
    } else if (user_data['email'] != undefined) {
        let email = user_data['email'].toString();
        let password = user_data['password'].toString();

        User.userLogin(email, password, 2, function(result){
            res.json(result);
        });

    } else {
        res.status(400);
        res.send('Invalid username/email/password supplied');
    };
};

exports.logout = function(req, res){
    User.userLogout();
};

exports.reset = function(req, res) {

    User.reset_server(function(result){
        res.json(result);
    });
};

exports.resample = function(req, res) {
    User.repopulate_db(function(result) {
        res.json(result);
    });
};

exports.create_auction = function(req, res) {
    User.createAuction(function(result) {
        res.json(result);
    });
};

exports.view_auctions = function(req, res) {
    User.getAuctions(function(result) {
        res.json(result);
    });
};