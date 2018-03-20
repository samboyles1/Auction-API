const auctions = require('../controllers/auctions.server.controller');
const auth = require('../../config/auth.js');

module.exports = function(app){
    app.route('/api/v1/auctions')
        .get(auctions.view_auctions)
        .post(auth.isAuthenticated, auctions.create_auction);
    app.route('/api/v1/auctions/:id')
        .get(auctions.get_one_auction)
        .patch(auth.isAuthenticated, auctions.update_auction);
    app.route('/api/v1/auctions/:id/bids')
        .get(auctions.get_bids)
        .post(auth.isAuthenticated, auctions.place_bid);

    app.route('/api/v1/auctions/:id/photos')
        .get(auctions.get_photos)
        .post(auth.isAuthenticated, auctions.add_photo)
        .delete(auth.isAuthenticated, auctions.delete_photo);
};
