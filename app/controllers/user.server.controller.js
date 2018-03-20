const User = require('../models/user.server.model');

exports.create_user = function(req, res) {

    try {
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

        User.createUser(values, function (result) {
            if (result === 400) {
                res.statusMessage = "Malformed request";
                res.status(result).send("Malformed request");
            } else {
                res.statusMessage = "OK";
                res.status(201);
                res.json({
                    "id": result['insertId']
                });
            }


        });
    } catch (err) {
        res.statusMessage = "Malformed request";
        res.status(400).send("Malformed request");
    }
};

exports.get_user = function(req, res) {
    let id = req.params.userId;
    let token = req.get('X-Authorization');


    User.getUser(id, token, function(result){
        if (result === 404) {
            res.sendStatus(404);
        } else {
            res.json(result);
        }

    });
};

exports.update_user = function(req, res) {

    try {
        let id = req.params.userId;
        let params = req.body;
        let str = "";
        for (let i in params) {
            let string = (i + ' = "' + params[i] + '",');
            str = str.concat(string);
        }
        str = str.substring(0, str.length - 1);

        User.updateUser(id, str, function (result) {
            if (result === 201) {
                res.statusMessage = "OK";
                res.status(result).send("OK");

            } else {
                res.statusMessage = "Unauthorized";
                res.status(result).send("Unauthorized");
            }
        });
    } catch (err) {
        res.statusMessage = "Unauthorized";
        res.status(401).send("Unauthorized");
    }
};

exports.login = function(req, res) {

    let user_data = {
        "username": req.query.username,
        "email": req.query.email,
        "password": req.query.password
    };

    if(req.query.password === undefined) {
        res.statusMessage = "Invalid username/email/password supplied";
        res.status(400).send("Invalid username/email/password supplied");
    }

    if (user_data['username'] !== undefined) {
        let user = user_data['username'].toString();
        let password = user_data['password'].toString();
        User.userLogin(user, password, 1, function(result){
            if(result === 400) {
                res.statusMessage = "Invalid username/email/password supplied";
                res.status(result).send("Invalid username/email/password supplied")
            } else {
                res.json(result);
            }


        });
    } else if (user_data['email'] !== undefined) {
        let email = user_data['email'].toString();
        let password = user_data['password'].toString();

        User.userLogin(email, password, 2, function(result){
            if(result === 400) {
                res.statusMessage = "Invalid username/email/password supplied";
                res.status(result).send("Invalid username/email/password supplied")
            } else {
                res.json(result);
            }
        });

    } else {
        res.statusMessage = "Invalid username/email/password supplied";
        res.status(400).send("Invalid username/email/password supplied");
    }
};

exports.logout = function(req, res){
    let token = req.get('X-Authorization');
    User.userLogout(token, function(result){
        res.sendStatus(result);

    });
};

exports.reset = function(req, res) {
    User.reset_server(function(result){
        res.sendStatus(result);
    });
};

exports.resample = function(req, res) {
    User.repopulate_db(function(result) {
        if (result === 201) {
            res.statusMessage = "Sample of data has been reloaded.";
            res.status(result).send("Sample of data has been reloaded.")
        } else {
            res.sendStatus(result);
        }
    });
};
