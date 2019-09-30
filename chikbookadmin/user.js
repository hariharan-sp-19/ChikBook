
/*var mongoose  = require('mongoose');
var Schema = mongoose.Schema;
var user = new Schema({
    username:{type:String,required:true},
    pass:String,
    admin:Number
},{collection:'user-data'});

module.exports = mongoose.model('userData',user);

*/


var mongoose  = require('mongoose');
var Schema = mongoose.Schema;
var user = new Schema({
    username:{type:String,required:true},
    pass:String,
    shopname:String,
    location:String,
    items:[{name:String,price:Number,stock:Number}],
    admin:Number,
    year:String,
  phone:String,
  flag:Number
},{collection:'user-data'});

module.exports = mongoose.model('userData',user);

