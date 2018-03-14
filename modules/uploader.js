const fs = require('fs');
const md5 = require('md5');
const multipart = require('connect-multiparty');
const path = require('path');
const request = require('request');
const sync = require('synchronize');

module.exports = (app, allow_test) => {

    app.post('/upload', multipart(), (rq, rs) => sync.fiber(() => {
        if (!rq.files.hasOwnProperty('image_file')) {
            rs.end('nope1!');
            return;
        }

        let file = rq.files.image_file;

        let data;
        try {
            data = sync.await(fs.readFile(file.path, sync.defer()));
        } catch (e) {
            console.log(e);
            rs.end('nope2!');
            return;
        }

        if (!file.name) {
            rs.end('nope3!');
            return;
        }

        let new_path = path.resolve(app.root + '/images/' + md5(file.name) + '-' + file.name);

        sync.await(fs.writeFile(new_path, data, sync.defer()));

        rs.end('ok');
    }));

    if (allow_test === true) {
        app.get('/upload-test', (rq, rs) => sync.fiber(() => {
            let filename = path.resolve(app.root + '/test-upload.jpg');

            try {
                sync.await(fs.access(filename, sync.defer()));
            } catch (e) {
                rs.send('no `test-upload.jpg` in root of app!');
                return;
            }

            request.post({
                url: rq.protocol + '://' + rq.headers.host + '/upload',
                formData: { 'image_file': fs.createReadStream(filename) }
            }, (err, response, body) => {
                if (err) {
                    rs.send(err, response, body);
                } else {
                    rs.send(response);
                }
            });

        }));
    }
};
