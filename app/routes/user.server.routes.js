const users = require('../controllers/user.server.controller');

module.exports = function(app){
    app.route('/api/users')
        .post(users.create);
    app.route('/api/users/:userId')
        .get(users.read)
        .patch(users.update)
    app.route('/api/users/login')
        .post(users.login)
    app.route('/api/users/logout')
        .post(users.logout)

    app.route('/api/reset')
        .post(users.reset)
    app.route('/api/resample')
        .post(users.resample)

    app.route('/api/auctions')
        .get(users.view_auctions)
        .post(users.create_auction)
    app.route('/api/auctions/:id')
};