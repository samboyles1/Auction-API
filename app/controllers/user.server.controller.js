const User = require('../models/user.server.model');

exports.userLoginToken = '';

exports.list = function(req, res) {
    User.getAll(function(result){
        res.json(result);
    });
};

//USERS methods
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
        res.json(result);
    });
};

exports.get_user = function(req, res) {
    let id = req.params.userId;
    User.getUser(id, function(result){
        res.json(result);
    });
};

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
        if (result === "Unauthorized") {
            res.status(401);
            res.json(result);
        }
        res.status(200);
        res.json(result);
    });
};

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
            userLoginToken = result['token'];
            console.log(userLoginToken);
            res.json(result);
        });
    } else if (user_data['email'] != undefined) {
        let email = user_data['email'].toString();
        let password = user_data['password'].toString();

        User.userLogin(email, password, 2, function(result){
            userLoginToken = result['token'];
            console.log(userLoginToken);
            res.json(result);
        });

    } else {
        res.status(400);
        res.send("Invalid username/email/password supplied");
    };
};
//TODO somehow store token
exports.logout = function(req, res){
    userLoginToken
    let data = {
        "token":req.body.token
    }
    let token = data['token'].toString();
    User.userLogout(token, function(result){
        // TODO Add an unauthorised 401 error
        res.status(200);
        res.send("OK");

    });
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
//TODO error message
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
        if (result === "Malformed auction data") {
            res.status(400);
            res.send(result);
        } else {
            res.status(200);
            res.json(result);
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
        if (result === "Unauthorized") {
            res.status(401);
            res.json(result);
        }
        res.status(200);
        res.json(result);
    });
}

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
    console.log(userLoginToken);
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