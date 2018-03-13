module.exports = (app, allow_test) => {
    app.post('/upload', (rq, rs) => {
        rs.send({ yeah: 'wat!' });
    });
    if (allow_test === true) {
        app.get('/upload-test', (rq, rs) => {
            rs.send('test upload');
        });
    }
};
