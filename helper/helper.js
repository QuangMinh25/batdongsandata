const cloudinary = require("cloudinary");
const _ = require('underscore');

const Q = require("q");

function upload(file) {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET

    });

    return new Q.Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(file, {width: 50, height: 50}, (err, res) => {
            if (err) {
                console.log('cloudinary err:', err);
                reject(err);
            } else {
                console.log('cloudinary res:', res);
                return resolve(res.url);
            }
        });
    });
};


module.exports.upload = upload;
