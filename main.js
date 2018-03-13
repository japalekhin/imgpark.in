const body_parser = require('body-parser');
const express = require('express');
const path = require('path');

let config = require('./config.js');

let app = express();
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(express.static('static')); // static assets
app.use(express.static('images')); // images
app.use('/', (rq, rs) => rs.sendFile(path.resolve(__dirname + '/index.html')));
app.use((rq, rs) => rs.send('We got a 404 Jim!'));
app.listen(config.port, () => console.log('Server started on', config.port, '!'));
