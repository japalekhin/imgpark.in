const body_parser = require('body-parser');
const express = require('express');
const path = require('path');

// initialize server
let app = express();
app.config = require('./config.js'); // load config
app.root = path.resolve(__dirname);
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

// serve web static assets first
app.use(express.static('static'));

// then serve images
app.use(express.static('images'));

// handle uploads
require('./modules/uploader.js')(app);

// finally, handle home and 404
app.all('/', (rq, rs) => rs.sendFile(path.resolve(app.root + '/index.html')));
app.use((rq, rs) => rs.send('We got a 404 Jim!'));

// start web server
app.listen(app.config.port, () => console.log('Server started on', app.config.port, '!'));
