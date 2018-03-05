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

    User.insert(values, function(result){
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
    return null;
};

exports.logout = function(req, res){
    return null;
};