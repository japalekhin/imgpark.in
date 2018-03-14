const body_parser = require('body-parser');
const express = require('express');
const path = require('path');

// load config
let config = require('./config.js');

// initialize server
let app = express();
app.root = path.resolve(__dirname);
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

// serve web static assets first
app.use(express.static('static'));

// then serve images
app.use(express.static('images'));

// handle uploads
require('./modules/uploader.js')(app, config.allow_test);

// finally, handle home and 404
app.all('/', (rq, rs) => rs.sendFile(path.resolve(app.root + '/index.html')));
app.use((rq, rs) => rs.send('We got a 404 Jim!'));

// start web server
app.listen(config.port, () => console.log('Server started on', config.port, '!'));
