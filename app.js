//modules -------------------------------
var express = require('express'),
    app = module.exports = express(),
	multer = require('multer'),
	jade = require('jade'),
	mongoHelper = require('./utilities/MongooseHelper'),
	attchHelper = require('./utilities/AttachmentHelper'),
	mongoose = require('mongoose'),
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
	admin = require('./routers/admin'),
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

//auth models and utility begin ---------------
var authModels = require("./Models/authentication/models")(app.set('db-uri')).InitModels();
var User = authModels.User;
var LoginToken = authModels.LoginToken;

var authUtilities = require("./Models/authentication/utility")(authModels);
//auth models and utility end --------------
//app.set('AuthUtilities', authUtilities);
app.AuthUtilities = authUtilities;
app.Conn = conn;
app.Mongoose = mongoose;
app.MongoHelper = mongoHelper;
app.AttchHelper = attchHelper;
app.Fs = fs;
app.BodyParser = bodyParser;
app.CircularJSON = CircularJSON;

var generalSettings = null;


//middlewares ------------------------------
app.use(cookieParser());
app.use(session({ secret: '123' }));
app.use(flash());
// parse urlencoded request bodies into req.body 
app.use(bodyParser.urlencoded());
app.use(multer({dest: __dirname + '/uploads/'}));
// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

app.use(function(req,res,next){
    res.locals.session = req.session;

	if( !generalSettings )
	{
		//get general settings.
		app.MongoHelper.QueryARecord( app.Mongoose, app.set('db-uri'), app.set('db-name') , "configurations", {"key":"general"}, {}, 
				function(entity)
				{
					if( !entity ) entity = {};
					//console.log('GET general setting ID: ' + entity._id);
					 generalSettings = entity;
				},
				function(err)
				{
					logger.error(err.message+":"+err.stack);
				}
			);
	}
	app.locals.GeneralSettings = generalSettings;

    next();
});

app.use("/public", express.static( path.join(__dirname, '/public')));
app.use("/about", about);
app.use("/admin", admin);

app.use("/assets", express.static( path.join(__dirname, '/sitetemplates/site1/assets')));


app.get('/', authUtilities.loadUser, function(req, res, next){
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

app.get('/logout',authUtilities.loadUser,function(req, res) {
	if (req.session) {
		if( req.currentUser && req.currentUser.email )
			LoginToken.remove({ email: req.currentUser.email }, function() {});
		res.clearCookie('logintoken');
		req.session.destroy(function() {});
	  }
	res.redirect('/');
});


app.get('/imageapi/:id', function(req, res) {
	var id = req.params.id;
	//var metatype="image/jpg";
	var metatype=null;
	attchHelper.RenderFileByIdWithMetaType( mongoose, conn, id, res, metatype, null,
		function()
		{
			console.log("success");
		},
		function(err)
		{
			console.log(err.message+":"+err.stack);
		}
	);
});


app.get('/header-logo-id', function(req, res) {
	mongoHelper.QueryARecord( mongoose, app.set('db-uri'), app.set('db-name') , "fs.files", {"metadata.imageusage":"logo"}, {}, 
		function(entity)
		{
			if( entity ) res.json({"success":true, "logoid":entity._id})
			else res.json({"success":true, "logoid":"000000000000000000000000"})
		},
		function(err)
		{
			res.json({"success":true, "error":err.message+":"+err.stack})
		}
	);
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
var WriteLogToFile = app.WriteLogToFile = function(fs, filepath , str)
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

