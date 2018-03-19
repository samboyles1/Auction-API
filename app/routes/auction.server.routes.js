const users = require('../controllers/auction.server.controller');
const auth = require('../../config/auth.js');

module.exports = function(app) {

    app.route('/api/v1/auctions')
        .get(users.view_auctions)
        .post(auth.isAuthenticated, users.create_auction);
    app.route('/api/v1/auctions/:id')
        .get(users.get_one_auction)
        .patch(auth.isAuthenticated, users.update_auction);
    app.route('/api/v1/auctions/:id/bids')
        .get(users.get_bids)
        .post(auth.isAuthenticated, users.place_bid);

    app.route('/api/v1/auctions/:id/photos')
        .get(users.get_photos)
        .post(auth.isAuthenticated, users.add_photo)
        .delete(auth.isAuthenticated, users.delete_photo);
};