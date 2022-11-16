var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CustomerSchema = new Schema({
    hovaten: {type: String, required: true},
    sodienthoai: {type: String, required: true},
    diachi: {type: String, required: true},
    ghichu: {type: String, required: true}
});

const Customer = mongoose.model("Customer", CustomerSchema, "Customer");
module.exports = Customer;