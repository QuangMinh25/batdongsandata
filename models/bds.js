var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BdsSchema = new Schema({
    gia: {type: String, required: true},
    sonha: {type: String, required: true},
    duong: {type: String, required: true},
    phuong: {type: String, required: true},
    quan: {type: String, required: true},
    dientich: {type: String,required: true},
    cautruc: {type: String, required: true},
    vitri: {type: String, required: true},
    chusohuu: {type: String, required: true},
    trangthai: {type: String, required: true},
    lienhe: {type: String, required: true},
    multiple_image: {
        type: []
    }

});

const Bds = mongoose.model("Bds", BdsSchema, "Bds");
module.exports = Bds;
