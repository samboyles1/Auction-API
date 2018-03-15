const User = require('../models/user.server.model');

//USERS methods

//done error code
exports.create_user = function(req, res) {
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
        if (result === 400) {
            res.statusMessage = "Malformed request";
            res.send(result, "Malformed request");
        } else {
            res.status(201);
            res.json({
                "id": result['insertId']
            });
        }


    });
};
//done error code
exports.get_user = function(req, res) {
    let id = req.params.userId;
    User.getUser(id, function(result){
        if (result === 404) {
            res.sendStatus(404);
        } else {
            res.json(result);
        }

    });
};
//done error code
exports.update_user = function(req, res) {
    let id = req.params.userId;
    let params = req.body;
    let str = "";
    for (let i in params) {
        let string = (i + ' = "' + params[i] + '",');
        str = str.concat(string);
    }
    str = str.substring(0, str.length-1);

    User.updateUser(id, str, function(result) {
        if (result === 201) {
            res.status(result).send("OK");

        } else {
            res.status(result).send("Unauthorized");
        }
    });
};
//done error code
exports.login = function(req, res) {

    let user_data = {
        "username": req.body.username,
        "email": req.body.email,
        "password": req.body.password
    }

    if (user_data['username'] != undefined) {
        let user = user_data['username'].toString();
        let password = user_data['password'].toString();
        User.userLogin(user, password, 1, function(result){
            if(result === 400) {
                res.status(result).send("Invalid username/email/password supplied")
            } else {
                res.json(result);
            }


        });
    } else if (user_data['email'] != undefined) {
        let email = user_data['email'].toString();
        let password = user_data['password'].toString();

        User.userLogin(email, password, 2, function(result){
            if(result === 400) {
                res.status(result).send("Invalid username/email/password supplied")
            } else {
                res.json(result);
            }
        });

    } else {
        res.status(400);
        res.send("Invalid username/email/password supplied");
    };
};

exports.logout = function(req, res){
    let token = req.get('X-Authorization');
    User.userLogout(token, function(result){
        if (result.ERROR === "Unauthorized"){
            res.sendStatus(401);
        } else {
            res.sendStatus(200);
        }

    });
};

exports.reset = function(req, res) {
    User.reset_server(function(result){
        res.sendStatus(result);

    });
};

exports.resample = function(req, res) {
    User.repopulate_db(function(result) {
        res.sendStatus(result);
    });
};

exports.create_auction = function(req, res) {
    let auction_data = {
        "categoryId":req.body.categoryId,
        "title":req.body.title,
        "description": req.body.description,
        "startDateTime": req.body.startDateTime,
        "endDateTime": req.body.endDateTime,
        "reservePrice": req.body.reservePrice,
        "startingBid": req.body.startingBid,
        "user_id": req.body.user_id
    }

    let category = auction_data['categoryId'].toString();
    let title = auction_data['title'].toString();
    let description = auction_data['description'].toString();
    let startTime = auction_data['startDateTime'].toString();
    let endTime= auction_data['endDateTime'].toString();
    let reserve = auction_data['reservePrice'].toString();
    let startBid = auction_data['startingBid'].toString();
    let userId = auction_data['user_id'].toString();

    let values = [
        [category],
        [title],
        [description],
        [startTime],
        [endTime],
        [reserve],
        [startBid],
        [userId]
    ];

    User.createAuction(values, function(result) {
        if (result['id']) {
            res.json(result);
        } else {
            res.sendStatus(result);

        }
    });
};

exports.update_auction = function(req, res) {
    let id = req.params.id;
    let params = req.body;
    let str = "";
    for (let i in params) {
        let string = (i + ' = "' + params[i] + '",');
        str = str.concat(string);
    }
    str = str.substring(0, str.length-1);

    User.updateAuction(id, str, function(result) {
        console.log(result);
        if (result === 201) {
            return res.status(result).send('OK');

        } else if (result === 404) {
            return res.status(result).send('Not found');
        } else res.sendStatus(400);

    });
};

exports.view_auctions = function(req, res) {
    User.getAuctions(function(result) {
        res.json(result);
    });
};

exports.get_auction = function(req, res) {
    let id = req.params.id;
    User.getOneAuction(id, function(result){
        res.json(result);
    });
};

exports.get_bids = function(req, res) {
    let id = req.params.id;
    User.getBids(id, function(result) {
        res.json(result);
    });
};

exports.place_bid = function(req, res) {
    let bid_data = {
        "amount":req.body.amount,
        "id":req.body.id
    };
    let amount = bid_data['amount'].toString();
    let id = bid_data['id'].toString();

    User.placeBid(amount, id, userLoginToken, function(result){
        res.json(result);
    });
};