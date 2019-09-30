
var mongoose  = require('mongoose');
var Schema = mongoose.Schema;
var user = new Schema({
    username:{type:String,required:true},
    pass:String,
    shopname:String,
    location:String,
    items:[{name:String,price:Number,stock:Number}],
    phone:String,
    year:String,
    flag:Number
},{collection:'user-data'});

module.exports = mongoose.model('userData',user);