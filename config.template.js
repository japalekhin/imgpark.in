let users = [];
users.push({ user: 'test', secret: 'gHh9bjgsnQ7eD8Rj7DWvnHDuTV80fQl4Fa8EE21TCqr8UPzoUqDbves0H7imjkF8' });

module.exports = {
    // server
    port: 80,
    allow_test: true,

    // image
    max_width: 2048,
    max_height: 2048,

    // user
    users: users
};