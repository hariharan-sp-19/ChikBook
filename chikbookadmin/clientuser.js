
var mongoose  = require('mongoose');
var Schema = mongoose.Schema;
var user = new Schema({
    username:{type:String,required:true},
    pass:String,
    shopname:String,
    location:String,
    items:[]
},{collection:'user-data'});

module.exports = mongoose.model('userData',user);