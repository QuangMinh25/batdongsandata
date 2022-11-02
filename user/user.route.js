const user_controller = require('../models/bds');
const multer = require("multer");
const express = require("express");
const router = express.Router();


let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        console.log("file", file);

    },
    filename: function (req, file, callback) {
        // console.log("multer file:", file);
        callback(null, file.originalname);
    }
});
let maxSize = 1000000 * 1000;
let upload = multer({
    storage: storage,
    limits: {
        fileSize: maxSize
    }
});


router.post("/create", upload.array("multiple_image", 10), Bds.create);
router.get("/find", Bds.find);

module.exports = router;
