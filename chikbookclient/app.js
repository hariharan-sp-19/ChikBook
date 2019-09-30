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
var multer  =   require('multer');
var app         =   express();
var fs = require('fs');
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/files');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});
var upload = multer({ storage: storage });      



mongoose.connect('localhost:27017/chiksoft');
var Schema = mongoose.Schema;
var app = express();


//Schema 

var restockschema = new Schema({
  name:String,
  location:String,
  shopname:String,
  request:Number,
  item:[String],
  phone:String,
  year:String
},{collection:'restock-list'});

var restockdb = mongoose.model('restockdb',restockschema);     

var items = new Schema({
     name:String,
     price:Number,
     stock:Number
},{collection:'item-list'});
var itemlist = mongoose.model('itemlist',items);

var prodetsch = new Schema({
     name:String,
     about:String,
     path:String
},{collection:'about-list'});
var aboutmod = mongoose.model('aboutmod',prodetsch);


var cash = new Schema({
     username:String,
     cash:Number,
     flag:Number,
     admin:Number,
     location:String,
     shopname:String,
     phone:String,
  year:String
},{collection:'cash-list'});
var cashreg = mongoose.model('cashreg',cash);

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
     phone:String,
  year:String,
     message:[{name:String,message:String,date:Date}]
},{collection:'message-list'});
var messagemod = mongoose.model('messagemod',messageSche);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/public'));
app.use(logger('dev'));
app.disable('etag');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"max",saveUninitialized:false, resave:false}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    if(req.user.flag==1){
      res.redirect('/login');
    }
    else{
    return next();
    console.log('ok');
  }
  }

  res.redirect('/login');
}


function isAdmin(req,res,next){
  if(req.isAuthenticated()){
    if(req.user.admin == 1){
      return next();
    }
  }
}


var userData = require(__dirname+'/user');


app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());
require('./passport')(passport);

app.get('/login',function(req,res){
	res.render('login');
});

app.get('/',isLoggedIn,function(req,res){
  res.redirect('/buy');
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
      res.redirect('/');
      
      });
      
    }
  })(req, res, next);
});

app.get('/signup',function(req,res){
	res.render('signup');
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
 location:req.body.location
};
for(var i=0;i<itemlistdb.length;i++){
  itemlistdb[i].stock=0;
}
var item2 = {
  name:req.body.email,
  message:[],
  shopname:req.body.shop,
 location:req.body.location
};
var item = {
 username:req.body.email,
 pass:req.body.password,
 shopname:req.body.shop,
 location:req.body.location,
 items:itemlistdb
};
  var restockitem =  {
  name:req.body.email,
 shopname:req.body.shop,
 location:req.body.location,
 request:0,
  item:[]
};
restockdb(restockitem).save();
userData(item).save();
messagemod(item2).save();
cashreg(item1).save();
res.redirect('/login')
}
});
});


app.listen(8000);
console.log('listenning');


var testlist = {
    "SerialNumbers": {
        "Apple": [
            {
                "Price": 20,
                "Qty":1
            }
        ],
        "Orange": [
            {
                "Price": 15,
                "Qty":1
            }
        ],
        "Chips": [
            {
                "Price": 30,
                "Qty":1
            }
        ],
        "Cool Drink": [
            {
                "Price": 40,
                "Qty":1
            }
        ]
    }
  };

var finalist = {
  "SerialNumbers": {}

};

var jsontest = [{name:'Apple',price:20},{name:'Orange',price:20},{name:'Chips',price:20}];

app.get('/buy',isLoggedIn,function(req,res){
 userData.findOne({username:req.user.username},function(err,data){
  var list=data.items;
  var poplist=[];
  for(var i=list.length-1;i>=0;i--){
    if(list[i].stock<1){
      list.splice(i, 1);
    }
  }
 res.render('shop',{var:list});
 console.log(req.user);
});
});

app.get('/getdata',function(req,res){
  itemlist.find({},function(err,data){
  for(var i=0;i<data.length;i++){
    finalist.SerialNumbers[data[i].name]=[{"Price":data[i].price,"Qty":1}];   
  }
  console.log(finalist);
   res.send(finalist);
 });
});

app.get('/logout',function(req, res){
    req.logout();
    res.redirect('/login');
  });


var temp,total;
app.post('/pay',function(req,res){
 temp = JSON.parse( Object.keys(req.body)[0] );

});
var tempdata = {};
var totaldata = {};
app.get('/payget',isLoggedIn,function(req,res){
   console.log(temp);
   var loggeduser = req.user.username;
   totaldata[loggeduser]={total:0};
   total=0;
   var array=[];
   console.log(temp);
   for(var i=0;i<temp.length;i++){
    temp[i]['tot']=temp[i]['price']*temp[i]['qty'];
    if(temp[i]['qty']==0){
      array.push(temp[i]['serial']);
    }
    else{
    total+=temp[i]['tot'];
   }
   }
   totaldata[loggeduser].tot=total;
   console.log(totaldata[loggeduser]);
  for(var j=0;j<array.length;j++){
    for(var i=0;i<temp.length;i++){
      if(array[j]==temp[i]['serial']){
        var newtemp = temp[i];
      temp[i] = temp[temp.length-1];
      temp[temp.length-1]=temp[i];
      temp.pop();
      }
    }
  }
  console.log(temp);
  tempdata[req.user.username]={bill:temp};
  if(total!=0){
   custlist.find({username:req.user.username},function(err,data){
     res.render('cust',{var: tempdata[loggeduser].bill,tot:totaldata[loggeduser].tot,cust:data});
    console.log(tempdata[loggeduser].bill + " " + totaldata[loggeduser].tot)
   })
 }
 else{
    res.redirect('/buy');
  }
});

var flag=1;
app.post('/cust',isLoggedIn,function(req,res){
  userData.findOne({username:req.user.username},function(err,dat){
    for(var i=0;i<temp.length;i++){
      for (var j=0; j<dat.items.length; j++) {
          if(tempdata[req.user.username].bill[i].serial==dat.items[j].name){
            dat.items[j].stock = dat.items[j].stock-tempdata[req.user.username].bill[i].qty;
            if(dat.items[j].stock<0){
              flag=0;
            }
          }
      }
    }
    //console.log(data);
    if(flag==1){
    dat.save();
    if(req.body.phone == undefined && flag==1){
    custlist.findOne({name:req.body.custnameselect},function(err,data){
if(err) return err;
data.freq +=1;
data.total += totaldata[req.user.username].tot;
data.save();
var item = {
     name:data.name,
     phone:data.phone,
     freq:data.freq,
     total:totaldata[req.user.username].tot,
     bill:tempdata[req.user.username].bill,
     grandtotal:data.total,
     date: new Date(),
     shopname:req.user.shopname,
     location:req.user.location,
     username:req.user.username
};
cashreg.findOne({username:req.user.username},function(err,datas){
datas.cash+=totaldata[req.user.username].tot;
datas.save();
});
hislist(item).save();
  });
    res.redirect('/buy');
  }
  else{
    var item={
      name:req.body.custname,
      phone:req.body.phone,
      freq:1,
      total:totaldata[req.user.username].tot,
      shopname:req.user.shopname,
      location:req.user.location,
      username:req.user.username
    };
    var item1 = {
      name:req.body.custname,
     phone:req.body.phone,
     freq:1,
     total:totaldata[req.user.username].tot,
     bill:tempdata[req.user.username].bill,
     grandtotal:totaldata[req.user.username].tot,
     date: new Date(),
     shopname:req.user.shopname,
     location:req.user.location,
     username:req.user.username
    };
cashreg.findOne({username:req.user.username},function(err,datas){
datas.cash+=totaldata[req.user.username].tot;
datas.save();
});
    hislist(item1).save();
    custlist(item).save();
     res.redirect('/buy');
  if(flag==1){
  temp=null;
  total=null;
  tempdata[req.user.username].bill = null;
  totaldata[req.user.username].total = null; 
}
  }
  }
  else{
userData.findOne({username:req.user.username},function(err,data){
  var list=data.items;
  var poplist=[];
  for(var i=list.length-1;i>=0;i--){
    if(list[i].stock<1){
      list.splice(i, 1);
    }
  }
 res.render('shop',{var:list,message:'you have less stocks'});
flag=1;
 console.log(req.user);
});
  }
    //console.log(data);
  });  
});

app.get('/his',isLoggedIn,function(req,res){
  hislist.find({username:req.user.username},function(err,data){
    console.log(data);
    res.render('his',{var:data});
  });
});

app.get('/cashreg',isLoggedIn,function(req,res){
  cashreg.findOne({username:req.user.username},function(err,data){
    if(data.admin==1 && data.cash!=0){
      res.render('cash',{var:'Pending...',dbdata:data});
    }
    else{
      res.render('cash',{dbdata:data});
    }
  });
});

app.get('/cashout',isLoggedIn,function(req,res){
  cashreg.findOne({username:req.user.username},function(err,data){
    data.admin =1;
    data.flag = data.cash;
    data.save();
  });
  cashreg.findOne({username:req.user.username},function(err,data){
    data.cash=0;
    data.save();
  });
  res.redirect('/cashreg');
});

app.get('/customer',isLoggedIn,function(req,res){
custlist.find({username:req.user.username},function(err,data){
  res.render('customer',{var:data});
});
});

app.get('/message',isLoggedIn,function(req,res){
  messagemod.findOne({name:req.user.username},function(err,data){
    res.render('message',{var:data.message});
    
  });
});

app.post('/message',isLoggedIn,function(req,res){
  messagemod.findOne({name:req.user.username},function(err,data){
    data.message.push({message:req.body.message,date:new Date(),name:req.user.username});
    data.save();
    console.log(data);
  });
  messagemod.findOne({name:req.user.username},function(err,data){
    res.render('message',{var:data.message});
    
  });

});

app.get('/invent',isLoggedIn,function(req,res){
  userData.findOne({username:req.user.username},function(err,data){
    res.render('invent',{var:data.items});
  });
});

app.get('/restock',isLoggedIn,function(req,res){
  userData.findOne({username:req.user.username},function(err,data){
    restockdb.findOne({name:req.user.username},function(err,datas){
    res.render('restock',{var:data.items,vars:datas.item});
  });
 });   
});

app.post('/restock',function(req,res){
restockdb.findOne({name:req.user.username},function(err,data){
data.item.push(req.body.restockitem);
data.request=1;
data.save();
});
res.redirect('/buy');
});

app.get('/upload',function(req,res){
      res.render('upload');
});

app.post('/up',upload.single('up'), function(req,res){
        var img = fs.readFileSync('./public/files/'+req.file.filename);
        var paths = './public/files/'+req.file.filename;
     var item = {
      name:req.body.product,
      path: paths,
      about:req.body.about
     }
     aboutmod(item).save();
     res.writeHead(200,{'Content-Type': 'text' });
      res.end('successful saved');
    // res.writeHead(200, {'Content-Type': 'image/gif' });
    // res.end(img, 'binary');   
});


app.get('/get/:name',function(req,res){
//aboutmod.findOne({},function(err,data){
//
//});
res.render('prodet');
});

