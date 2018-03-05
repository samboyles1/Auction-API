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
};