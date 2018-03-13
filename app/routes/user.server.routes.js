const users = require('../controllers/user.server.controller');

module.exports = function(app){
    app.route('/api/users')
        .post(users.create_user);
    app.route('/api/users/:userId')
        .get(users.get_user)
        .patch(users.update_user);
    app.route('/api/users/login')
        .post(users.login);
    app.route('/api/users/logout')
        .post(users.logout);

    app.route('/api/reset')
        .post(users.reset);
    app.route('/api/resample')
        .post(users.resample);

    app.route('/api/auctions')
        .get(users.view_auctions)
        .post(users.create_auction);
    app.route('/api/auctions/:id')
        .get(users.get_auction);
    app.route('/api/auctions/:id/bids')
        .get(users.get_bids)
        .post(users.place_bid);
};