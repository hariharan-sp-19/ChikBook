var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');
var session = require('express-session');
var mongoose  = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

hbs.registerHelper('toJSON', function(obj) {
    return JSON.stringify(obj, null, 3);
});

mongoose.connect('localhost:27017/chiksoft');
var Schema = mongoose.Schema;
var app = express();
//
//Schema 

var restockschema = new Schema({
  name:String,
  location:String,
  shopname:String,
  request:Number,
  item:[String],
  year:String,
  phone:String
},{collection:'restock-list'});

var restockdb = mongoose.model('restockdb',restockschema);     

var cash = new Schema({
     username:String,
     cash:Number,
     flag:Number,
     admin:Number,
     location:String,
     shopname:String,
     year:String,
  phone:String
},{collection:'cash-list'});
var cashreg = mongoose.model('cashreg',cash);


var collectedcash = new Schema({
     username:String,
     cash:Number,
     date:Date
},{collection:'collected-cash'});
var collectedcashmod = mongoose.model('collectedcashmod',collectedcash);

var customerschme = new Schema({
     name:String,
     phone:String,
     freq:Number,
     total:Number,
     username:String,
     location:String,
     shopname:String
},{collection:'customer-list'});
var custlist = mongoose.model('custlist',customerschme);

var hisschme = new Schema({
     name:String,
     phone:String,
     freq:Number,
     total:Number,
     bill:[],
     grandtotal:Number,
     date:Date,
     location:String,
     username:String,
     shopname:String
},{collection:'history-list'});
var hislist = mongoose.model('hislist',hisschme);

var messageSche = new Schema({
     name:String,
     location:String,
     shopname:String,
     message:[{name:String,message:String,date:Date}],
     year:String,
  phone:String
},{collection:'message-list'});
var messagemod = mongoose.model('messagemod',messageSche);

var items = new Schema({
     name:String,
     price:Number,
     stock:Number
},{collection:'item-list'});
var itemlist = mongoose.model('itemlist',items);

var restockhissch = new Schema({
  username:String,
  item:[String],
  stock:Number,
  date:Date
},{collection:'restock-history-list'});

var restockhis = mongoose.model('restockhis',restockhissch); 

//userData({username:'admin',pass:'chiksoftadmin',admin:1,items:[]}).item.save();


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(__dirname + '/views'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"max",saveUninitialized:false, resave:false}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    if(req.user.admin == 1){
      return next();
    }
    else{
      res.redirect('/login');
    }
  }

  res.redirect('/login');
}

function isAdmin(req,res,next){
  if(req.isAuthenticated()){
    if(req.user.admin == 1){
      return next();
    }
    else{
      res.redirect('/login');
    }
  }
  else{
      res.redirect('/login');
    }
}


var userData = require(__dirname+'/user');

//userData({username:'admin',pass:'chiksoftadmin',admin:1,items:[]}).save();

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());
require('./passport')(passport);

app.get('/',isLoggedIn,function(req,res){
  res.render('home');
});


app.get('/login',function(req,res){
	res.render('login');
});


app.post('/login',function(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {
    if (user === false) {
      // handle login error ...
      res.render('login',{ message: req.flash('loginMessage') });
    } else {
      req.login(user, function(err) {
        // handle successful login ...
      console.log(user);
      res.redirect('/admin');
      
      });
      
    }
  })(req, res, next);
});

app.get('/signup',function(req,res){
	res.render('signup');
});





app.listen(3000);
console.log('listenning');

app.get('/admin',isLoggedIn,function(req,res){
  userData.findOne({username:req.user.username},function(err,data){
    console.log(data.items);
    res.render('admin',{var:data.items});
  });
});


app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
  });

app.get('/add',isLoggedIn,function(req,res){
  itemlist.find({},function(err,data){
    res.render('add',{var:data});
  });
});

app.post('/add',isLoggedIn,function(req,res){
  var item ={};
  item.name = req.body.item;
  item.price = req.body.price;
  item.stock = 0;
  itemlist(item).save();
  var item2 = item;
  item2.stock=0;
  var item3 = item;
  userData.update({},{ $push: { items: item2 } },{"multi": true},function(err,data){
    console.log(data);
  });
   userData.findOne({username:req.user.username},function(err,data){
    for(var i=0;i<data.items.length;i++){
      if(data.items[i].name==req.body.item){
data.items[i].stock = parseInt(req.body.stock);
      }
    }
    data.save();
  });
  res.redirect('/add');
});

app.get('/item',isLoggedIn,function(req,res){
userData.findOne({username:req.user.username},function(err,data){
  res.render('item',{var:data.items});
});
});

app.get('/custview',isLoggedIn,function(req,res){
  custlist.find({},function(err,data){
    res.render('custviewlist',{var:data});
  });
});

app.get('/restock',isLoggedIn,function(req,res){
  restockdb.find({},function(err,data){
    res.render('restock',{var:data});
  });
});

/*app.get('/custview',function(req,res){
  userData.find({},function(err,data){
    res.render('custview',{var:data});
  });
});

app.post('/custview',function(req,res){
  if(req.body.location!=undefined){
    custlist.find({location:req.body.location},function(err,data){
      res.render('custviewlist',{var:data});
    });
  }
  else if(req.body.shopname!=undefined){
    custlist.find({shopname:req.body.shopname},function(err,data){
      res.render('custviewlist',{var:data});
    });
  }
  else{
    custlist.find({username:req.body.username},function(err,data){
      res.render('custviewlist',{var:data});
    });
  }
});*/

app.post('/getstock',isLoggedIn,function(req,res){
restockdb.findOne({name:req.body.id},function(err,data){
  console.log(data.item);
  userData.findOne({username:req.user.username},function(err,datas){
  res.render('addstock',{var:data,vars:data.item,item:datas.items});
});
});
});

app.post('/getmessage',isLoggedIn,function(req,res){
messagemod.findOne({name:req.body.id},function(err,data){
  console.log(data.message);
  res.render('meslist',{var:data.message,id:data.name});
});
});

app.get('/message',isLoggedIn,function(req,res){
  messagemod.find({},function(err,data){
  res.render('message',{var:data});
});
});

app.post('/message',isLoggedIn,function(req,res){
  messagemod.findOne({name:req.body.id},function(err,data){
  data.message.push({name:'admin',message:req.body.message,date:new Date()})
  data.save();
  res.render('meslist',{var:data.message,id:data.name});
});
});

app.post('/addstock',isLoggedIn,function(req,res){
  var item=req.body.item;
  if(typeof(item)=='string'){
    var string = item;
    item = new Array();
    item.push(string);
  }
  var id = req.body.id;
  var stock = parseInt(req.body.stock);
  var flag=1;
  userData.findOne({username:req.user.username},function(err,data){
    for(var i=0;i<item.length;i++){
      for(var j=0;j<data.items.length;j++){
      if(data.items[j].name==item[i]){
        data.items[j].stock-=stock;
        if(data.items[j].stock<0){
          data.items[j].stock+=stock;
          flag=0;
        }
      }
    if(flag==0){
      break;
    }
    }
    if(flag==0){
      break;
    }
    }
    if(flag==1){
    data.save(function(err){
    if(err){ return next(err); }
    else{
      restockdb.findOne({name:id},function(err,datas){
        var newitem = {};
        newitem.username = id;
        newitem.item = item;
        newitem.stock = stock;
        newitem.date = new Date();
        restockhis(newitem).save(function(err,data){
          console.log(data);
        });
        userData.findOne({username:id},function(err,data){
    for(var i=0;i<item.length;i++){
      for(var j=0;j<data.items.length;j++){
      if(data.items[j].name==item[i]){
        data.items[j].stock+=stock;
        for(var k=0;k<datas.item.length;k++){
          if(datas.item[k]==item[i]){
            datas.item.splice(k, k+1);
          }
        }
      }
    }
    }
    if(datas.item.length == 0){
      datas.request = 0;
    }
    data.save();
    datas.save();
    res.redirect('/item');
  });
      });
    }
});
  }else{
      res.render('addstock',{message:'you have got less stock'});
    }
  });
});

app.post('/addwarehouse',isLoggedIn,function(req,res){
  var item= req.body.item;
  var stock = parseInt(req.body.stock);
  console.log(item);
  userData.findOne({username:req.user.username},function(err,data){
    for(var i=0;i<data.items.length;i++){
      if(data.items[i].name==item){
        console.log()
        data.items[i].stock+=stock;
      }
    }
    data.save();
  res.render('item',{var:data.items});
  });
});

app.get('/cashreg',isLoggedIn,function(req,res){
cashreg.find({},function(err,data){
res.render('cash',{var:data});
});
});

app.get('/restockhis',function(req,res){
restockhis.find({},function(err,data){
res.render('restockhis',{var:data});
});
});

app.post('/cashout',isLoggedIn,function(req,res){
 cashreg.findOne({username:req.body.id},function(err,data){
if(data.admin == 1){
collectedcashmod({username:req.body.id,cash:data.flag,date:new Date()}).save();
data.admin=0;
data.flag=0;
data.save();
res.redirect('/cashreg');
}
else{
  cashreg.find({},function(err,data){
res.render('cash',{var:data,message:"user not cashed-out yet"});
});
}
}); 
});


app.get('/collcash',isLoggedIn,function(req,res){
  var total=0;
  collectedcashmod.find({},function(err,data){
    for(var i=0;i<data.length;i++){
      total+=data[i].cash;
    }
     res.render('collcash',{var:data,tot:total});
  });
});

var itemlistdb;
itemlist.find({},function(err,data){
itemlistdb=data;
});

app.post('/signup',function(req,res){
userData.findOne({username:req.body.email},function(err,data){
if(err) return err;
if(data){
  res.render('signup',{message:'username taken'})
}
else{
var item1 = {
 username:req.body.email,
 cash:0,
 flag:0,
 admin:0,
 shopname:req.body.shop,
 location:req.body.location,
 year:req.body.year,
 phone:req.body.phone
};
for(var i=0;i<itemlistdb.length;i++){
  itemlistdb[i].stock=0;
}
var item2 = {
  name:req.body.email,
  message:[],
  shopname:req.body.shop,
 location:req.body.location,
 year:req.body.year,
 phone:req.body.phone
};
var item = {
 username:req.body.email,
 pass:req.body.password,
 shopname:req.body.shop,
 location:req.body.location,
 items:itemlistdb,
 year:req.body.year,
 phone:req.body.phone,
 flag:0
};
  var restockitem =  {
  name:req.body.email,
 shopname:req.body.shop,
 location:req.body.location,
 request:0,
  item:[],
  year:req.body.year,
 phone:req.body.phone
};
restockdb(restockitem).save();
userData(item).save();
messagemod(item2).save();
cashreg(item1).save();
res.redirect('/admin')
}
});
});

app.get('/delete',isLoggedIn,function(req,res){
userData.find({},function(err,data){
for(var i=0;i<data.length;i++){
  if(data[i].username=='admin'){
    var temp = data[i];
    data[i]=data[data.length];
    data[data.length]=temp;
    data.pop();
  }
}
res.render('delete',{vars:data});
});
  
  app.post('/delete',isLoggedIn,function(req,res){
restockdb.find({ name:req.body.id }).remove().exec();
userData.find({ username:req.body.id }).remove().exec();
messagemod.find({ name:req.body.id }).remove().exec();
cashreg.find({ username:req.body.id }).remove().exec();
res.redirect('/admin');
  });
});

app.post('/delitem',isLoggedIn,function(req,res){
  itemlist.find({ name:req.body.item }).remove().exec();
  userData.update({}, {$pull: {items: {name: req.body.item}}},{"multi": true}, function(err, data){
  //console.log(err, data);
  res.redirect('/admin');
});
  /*userData.find({},function(err,data){
    for(var i=0;i<data.length;i++){
      var until = data[i].items.length;
      for(var j=0;j<until;i++){
        if(data[i].items[j].name==req.body.item){
          var temp = data[i].items[j];
    data[i].items[j]=data[i].items[data[i].item.length];
    data[i].items[data[i].items.length]=temp;
    data.pop();
        }
      }
    }
  data.save();
  });*/
});

app.get('/cldet',isLoggedIn,function(req,res){
  userData.find({},function(err,data){
for(var i=0;i<data.length;i++){
  if(data[i].username=='admin'){
    var temp = data[i];
    data[i]=data[data.length];
    data[data.length]=temp;
    data.pop();
  }
}
res.render('cldet',{vars:data});
});
});
var tempname;
app.get('/speccus/:name',isLoggedIn,function(req,res){
    res.redirect('/spechis');
    tempname=req.params.name;
});

app.get('/spechis',isLoggedIn,function(req,res){
hislist.find({name:tempname},function(err,data){
      res.render('his',{var:data});
    });
});

app.get('/block',isLoggedIn,function(req,res){
  userData.find({},function(err,data){
for(var i=0;i<data.length;i++){
  if(data[i].username=='admin' || data[i].flag==1){
    var temp = data[i];
    data[i]=data[data.length];
    data[data.length]=temp;
    data.pop();
  }
}
res.render('block',{vars:data});
});

});

app.get('/unblock',isLoggedIn,function(req,res){
userData.find({},function(err,data){
for(var i=0;i<data.length;i++){
  if(data[i].username=='admin' || data[i].flag==0){
    var temp = data[i];
    data[i]=data[data.length];
    data[data.length]=temp;
    data.pop();
  }
}
res.render('unblock',{vars:data});
});
});

app.post('/block',isLoggedIn,function(req,res){
  userData.findOne({username:req.body.id},function(err,data){
    data.flag=1;
    data.save();
    res.redirect('/admin');
  });
});

app.post('/unblock',isLoggedIn,function(req,res){
  userData.findOne({username:req.body.id},function(err,data){
    data.flag=0;
    data.save();
  });
  res.redirect('/admin');
});

app.post('/stockup',function(req,res){
  userData.findOne({username:req.user.username},function(err,data){
    for(var i=0;i<data.items.length;i++){
      if(data.items[i].name==req.body.item){
        data.items[i].stock = parseInt(req.body.stock);
        data.save();
      }
    }
  });
  res.redirect('/item');
});
