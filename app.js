//modules -------------------------------
var express = require('express'),
    app = module.exports = express(),
	jade = require('jade'),
	models = require('./models'),
	mongoHelper = require('./utilities/MongooseHelper'),
	mongoose = require('mongoose'),
	LoginToken,
	flash  = require('flash'),
	cookieParser = require('cookie-parser'),
	session      = require('express-session'),
	fs = require('fs'),
	db,
	morgan = require('morgan'),
	CircularJSON = require('circular-json'),
	bodyParser = require('body-parser'),
	http = require('http').Server(app),
	path = require('path'),
	//About router
	about = require('./routers/about'),
	//admin = require('./routers/admin'),
	// create a write stream (in append mode)
	accessLogStream = fs.createWriteStream(__dirname + '/mainlog.log', {flags: 'a'});

//set application level variables -------------------------------------------
app.set('views', __dirname + '/views');
app.set('db-uri', 'mongodb://localhost/henrynctest-production');
app.set('db-name', 'henrynctest-production');
app.set('server-name', 'localhost');
app.set('port-number', 27017);

//global variables.
conn = mongoose.createConnection(app.set('server-name'), app.set('db-name'), app.set('port-number'));

//modules and utilities  begin ---------------
var HenryNcModels = require("./Utilities/HenryNcModels");

var henryNcModels = HenryNcModels(app.set('db-uri')).InitModels();
var User = henryNcModels.User;
var LoginToken = henryNcModels.LoginToken;

var HenryNcUtilities = require("./Utilities/Utilities");
var henryNcUtilities = HenryNcUtilities(henryNcModels);
//modules and utilities  end --------------


//middlewares ------------------------------
app.use(cookieParser());
app.use(session({ secret: '123' }));
app.use(flash());
// parse urlencoded request bodies into req.body 
app.use(bodyParser.urlencoded());
// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

app.use("/public", express.static( path.join(__dirname, '/public')));
app.use("/about", about);
//app.use("/admin", admin);


app.get('/', henryNcUtilities.loadUser, function(req, res){
    res.render('index.jade', {
		reqA:req
  });
});

//Sessions
app.get('/sessions/new', function(req, res) {
  res.render('sessions/new.jade', {
	user: new User()
  });
});


app.get('/chat', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/users/new', function(req, res) {
  res.render('users/new.jade', {
     user: new User()
  });
});

app.post('/users.:format?', function(req, res) {
  var user = new User(req.body.user);

  //WriteLogToFile( fs, null, JSON.stringify(user) );

  function userSaveFailed(message) {
    res.render('users/new.jade', {
      user: user,
	  message: {'type':'warning','message':message}
    });
  }
   
  user.save(function(err) {
    if (err) 
	{
		var message = mongoHelper.GetMongooseErrorMessageFromCode(err.code);
		if( !message )
			message = err.message;
		return userSaveFailed(message);
	}

    //req.flash('warning', 'Your account has been created');
    switch (req.params.format) {
      case 'json':
        res.send(user.toObject());
      break;

      default:
        req.session.user_id = user.id;
	    req.session.email = user.email;

		res.render('index.jade', {
			 message: {'type':'success','message':'Your account has been created'}
		});
        //res.redirect('/');
    }

  });

});

app.post('/sessions', function(req, res) {
  User.findOne({ email: req.body.user.email }, function(err, user) {
	  if( user && user.authenticate(req.body.user.password) )
	  {
		req.session.user_id = user.id;
	    req.session.email = user.email; 

		// Remember me
		  if (req.body.remember_me) {
			var loginToken = new LoginToken({ email: user.email });
			loginToken.save(function() {
			  res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
			  res.redirect('/');
			});
		  } else {
			res.redirect('/');
		  }
	  }
	  else
	  {
	  	res.render('sessions/new.jade', {
			message: {'type':'warning','message':'Log in failed.'},
			user:req.body.user
		});
	  }
  });
});

app.get('/logout',henryNcUtilities.loadUser,function(req, res) {
	if (req.session) {
		if( req.currentUser && req.currentUser.email )
			LoginToken.remove({ email: req.currentUser.email }, function() {});
		res.clearCookie('logintoken');
		req.session.destroy(function() {});
	  }
	res.redirect('/');
});



/*
//Parameters:
//fs, node.js fs object.
//filepath, filepath of the file. if null, use __dirname + '/debug.log' dy default.
//obj: the str to be write into the file, if is object, use JSON.stringify(or CircularJSON.stringify(obj) for DOM) to convert it to string.
Usage:
	fs = require('fs'),
	filepath = __dirname + '/debug.log';
    WriteLogToFile( fs, filepath, JSON.stringify(obj) );
*/
var WriteLogToFile = function(fs, filepath , str)
{
	if( !filepath )
	{
		filepath = __dirname + '/debug.log';
	}

	fs.writeFile(filepath, str, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("The file was saved!");
		}
	});
}


//other logics -----------------------------------------

http.listen(3000, function(){
  console.log('listening on *:3000');
});

