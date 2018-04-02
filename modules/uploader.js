const fs = require('fs');
const md5 = require('md5');
const multipart = require('connect-multiparty');
const path = require('path');
const request = require('request');
const result = require('./result.js');
const sharp = require('sharp');
const sync = require('synchronize');

module.exports = app => {

    let upload = rq => {
        let r = new result();

        if (!rq.files.hasOwnProperty('image_file')) {
            return r.set_message('No image file submitted!');
        }
        let file = rq.files.image_file;
        if (!file.name) {
            return r.set_message('No filename, weird.');
        }

        // auth check here
        if (!rq.headers.hasOwnProperty('upload-user') || !rq.headers.hasOwnProperty('upload-secret')) {
            return r.set_message('Not authorized!');
        }
        let user_index = app.config.users.findIndex(user => user.user === rq.headers['upload-user']);
        if (user_index === -1) {
            return r.set_message('Not authorized!');
        }
        let user_item = app.config.users[user_index];
        if (user_item.secret !== rq.headers['upload-secret']) {
            return r.set_message('Access denied!');
        }

        // check content-type
        if (!['image/jpeg', 'image/png',].includes(file.headers['content-type'])) {
            return r.set_message('Image must be a JPG or PNG! Gave `' + file.headers['content-type'] + '`.');
        }

        // get image data
        let image_data;
        try {
            image_data = sync.await(fs.readFile(file.path, sync.defer()));
        } catch (e) {
            return r.set_message('Image data can not be read!');
        }

        // resize image
        let sim = sharp(image_data);
        let metadata = sync.await(sim.metadata(sync.defer()));

        // check content-type (AGAIN!)
        if (!['jpeg', 'png',].includes(metadata.format)) {
            return r.set_message('Image must be a JPG or PNG! Gave `' + metadata.format + '`.');
        }

        let extension;
        switch (metadata.format) {
            case 'jpeg':
                extension = 'jpg';
                break;
            case 'png':
                extension = 'png';
                break;
        }
        let now = new Date();

        // prepare write path
        let write_dir = app.root + '/images/';
        if (!fs.existsSync(write_dir)) {
            fs.mkdirSync(write_dir);
        }
        write_dir += now.getFullYear() + '/';
        if (!fs.existsSync(write_dir)) {
            fs.mkdirSync(write_dir);
        }
        write_dir += (now.getMonth() + 1) + '/';
        if (!fs.existsSync(write_dir)) {
            fs.mkdirSync(write_dir);
        }
        write_dir += now.getDate() + '/';
        if (!fs.existsSync(write_dir)) {
            fs.mkdirSync(write_dir);
        }
        let write_filename = md5(image_data) + '.' + extension;
        let write_path = path.resolve(write_dir + write_filename);

        // resize if necessary
        if (metadata.width > app.config.max_width || metadata.height > app.config.max_height) {
            sim.resize(app.config.max_width, app.config.max_height).max();
        }
        // save file
        sync.await(sim.toFile(write_path, sync.defer()));

        r.payload.url = rq.protocol + '://' + rq.headers.host + '/' + now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() + '/' + write_filename;
        return r.set_success(true).set_message('Upload successful!');
    };

    app.post('/upload', multipart(), (rq, rs) => sync.fiber(() => {
        rs.send(upload(rq));
    }));

    if (app.config.allow_test === true) {
        app.get('/upload-test', (rq, rs) => sync.fiber(() => {
            let filename = path.resolve(app.root + '/test-upload.jpg');

            try {
                sync.await(fs.access(filename, sync.defer()));
            } catch (e) {
                rs.send('no `test-upload.jpg` in root of app!');
                return;
            }

            if (app.config.users.length === 0) {
                rs.send('no test user!');
                return;
            }
            request.post({
                url: rq.protocol + '://' + rq.headers.host + '/upload',
                headers: {
                    'upload-user': app.config.users[0].user,
                    'upload-secret': app.config.users[0].secret
                },
                formData: { 'image_file': fs.createReadStream(filename) }
            }, (err, response, body) => {
                if (err) {
                    rs.send(err, response, body);
                } else {
                    rs.send(body);
                }
            });

        }));
    }
};
