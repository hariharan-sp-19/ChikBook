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
    callback(null, './public');
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
  item:[String]
},{collection:'restock-list'});

var restockdb = mongoose.model('restockdb',restockschema);     

var items = new Schema({
     name:String,
     price:Number,
     stock:Number
},{collection:'item-list'});
var itemlist = mongoose.model('itemlist',items);


var cash = new Schema({
     username:String,
     cash:Number,
     flag:Number,
     admin:Number,
     location:String,
     shopname:String
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
     message:[{name:String,message:String,date:Date}]
},{collection:'message-list'});
var messagemod = mongoose.model('messagemod',messageSche);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(__dirname + '/views'));
app.use(logger('dev'));
app.disable('etag');
app.use(fileupload());
app.use(fileupload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"max",saveUninitialized:false, resave:false}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    return next();
    console.log('ok');
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
    if(list[i].stock<3){
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

app.get('/payget',isLoggedIn,function(req,res){
   console.log(temp);
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
  if(total!=0){
   custlist.find({username:req.user.username},function(err,data){
     res.render('cust',{var: temp,tot:total,cust:data});
   })
 }
 else{
    res.redirect('/buy');
  }
});
var flag=0;
app.post('/cust',isLoggedIn,function(req,res){
  if(req.body.phone == undefined){
    custlist.findOne({name:req.body.custnameselect},function(err,data){
if(err) return err;
data.freq +=1;
data.total += total;
data.save();
var item = {
     name:data.name,
     phone:data.phone,
     freq:data.freq,
     total:total,
     bill:temp,
     grandtotal:data.total,
     date: new Date(),
     shopname:req.user.shopname,
     location:req.user.location,
     username:req.user.username
};
cashreg.findOne({username:req.user.username},function(err,datas){
datas.cash+=total;
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
      total:total,
      shopname:req.user.shopname,
      location:req.user.location,
      username:req.user.username
    };
    var item1 = {
      name:req.body.custname,
     phone:req.body.phone,
     freq:1,
     total:total,
     bill:temp,
     grandtotal:total,
     date: new Date(),
     shopname:req.user.shopname,
     location:req.user.location,
     username:req.user.username
    };
cashreg.findOne({username:req.user.username},function(err,datas){
datas.cash+=total;
datas.save();
});
    hislist(item1).save();
    custlist(item).save();
     res.redirect('/buy');
  }
  userData.findOne({username:req.user.username},function(err,data){
    for(var i=0;i<temp.length;i++){
      for (var j=0; j<data.items.length; j++) {
          if(temp[i].serial==data.items[j].name){
            data.items[j].stock = data.items[j].stock-temp[i].qty;
          }
      }
    }
    console.log(data);
    data.save(function(err,data){
      flag=1;
    });
    console.log(data);
if(flag==1){
  temp=null;
  total=null;
  flag=0;
}
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



/*

app.post('/upload', function (req, res) {
    var tempPath = req.files.file.path,
        targetPath = path.resolve('./uploads/image.png');
    if (path.extname(req.files.file.name).toLowerCase() === '.png') {
        fs.rename(tempPath, targetPath, function(err) {
            if (err) throw err;
            console.log("Upload completed!");
        });
    } else {
        fs.unlink(tempPath, function () {
            if (err) throw err;
            console.error("Only .png files are allowed!");
        });
    }
    // ...
});

app.get('/upload',function(req,res){
  res.render('upload');
});

app.get('/image.png', function (req, res) {
    res.sendfile(path.resolve('./uploads/image.png'));
}); 


app.post('/upload', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  let sampleFile = req.files.name;
 
  // Use the mv() method to place the file somewhere on your server 
  sampleFile.mv(__dirname+'/check/filename.jpg', function(err) {
    if (err)
      return res.status(500).send(err);
 
    res.send('File uploaded!');
  });
});*/