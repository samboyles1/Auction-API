const users = require('../controllers/user.server.controller');
const auth = require('../../config/auth.js');

module.exports = function(app){
    app.route('/api/v1/users')
        .post(users.create_user);
    app.route('/api/v1/users/:userId')
        .get(users.get_user)
        .patch(auth.isAuthenticated, users.update_user);
    app.route('/api/v1/users/login')
        .post(users.login);
    app.route('/api/v1/users/logout')
        .post(auth.isAuthenticated, users.logout);

    app.route('/api/v1/reset')
        .post(users.reset);
    app.route('/api/v1/resample')
        .post(users.resample);

    app.route('/api/v1/auctions')
        .get(users.view_auctions)
        .post(auth.isAuthenticated, users.create_auction);
    app.route('/api/v1/auctions/:id')
        .get(users.get_auction)
        .patch(auth.isAuthenticated, users.update_auction);
    app.route('/api/v1/auctions/:id/bids')
        .get(users.get_bids)
        .post(auth.isAuthenticated, users.place_bid);

    app.route('/api/v1/auctions/:id/photos')
        .get(users.get_photos)
        .post(auth.isAuthenticated, users.add_photo)
        .delete(auth.isAuthenticated, users.delete_photo);

};