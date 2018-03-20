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
};