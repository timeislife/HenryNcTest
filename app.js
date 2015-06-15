var express = require('express'),
    app = module.exports = express(),
	jade = require('jade'),
	models = require('./models'),
	mongoose = require('mongoose'),
	User,
	LoginToken,
	flash  = require('flash'),
	cookieParser = require('cookie-parser'),
	session      = require('express-session'),
	fs = require('fs'),
	db,
	morgan = require('morgan'),
	CircularJSON = require('circular-json'),
	bodyParser = require('body-parser'),
	http = require('http').Server(app);

var path = require('path');

app.use(cookieParser());
app.use(session({ secret: '123' }));
app.use(flash());

// parse urlencoded request bodies into req.body 
app.use(bodyParser.urlencoded());

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/mainlog.log', {flags: 'a'})
// setup the logger
app.use(morgan('combined', {stream: accessLogStream}))

app.set('views', __dirname + '/views');
app.set('db-uri', 'mongodb://localhost/henrynctest-production');


models.defineModels(mongoose, function() {
  app.User = User = mongoose.model('User');
  app.LoginToken = LoginToken = mongoose.model('LoginToken');
  db = mongoose.connect(app.set('db-uri'));
})

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

function authenticateFromLoginToken(req, res, next) {
  var cookie = JSON.parse(req.cookies.logintoken);

  LoginToken.findOne({ email: cookie.email,
                       series: cookie.series,
                       token: cookie.token }, (function(err, token) {
    if (!token) {
      res.redirect('/sessions/new');
      return;
    }

    User.findOne({ email: token.email }, function(err, user) {
      if (user) {
        req.session.user_id = user.id;
        req.currentUser = user;

        token.token = token.randomToken();
        token.save(function() {
          res.cookie('logintoken', token.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
          next();
        });
      } else {
        res.redirect('/sessions/new');
      }
    });
  }));
}

function loadUser(req, res, next) {
  if (req.session.user_id) {
    User.findById(req.session.user_id, function(err, user) {
      if (user) {
        req.currentUser = user;
		req.session.user_id = user.id;
	    req.session.email = user.email; 
        next();
      } else {
        res.redirect('/sessions/new');
      }
    });
  } else if (req.cookies.logintoken) {
    authenticateFromLoginToken(req, res, next);
  } else {
    res.redirect('/sessions/new');
  }
}

app.get('/', loadUser, function(req, res){
    res.render('index.jade', {
		reqA:req
  });
});

// Sessions
app.get('/sessions/new', function(req, res) {
  res.render('sessions/new.jade', {
	user: new User()
  });
});

app.use("/public", express.static( path.join(__dirname, '/public')));




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
		var message = GetMongooseErrorMessage(err.code);
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

app.get('/logout',loadUser,function(req, res) {
	if (req.session) {
		if( req.currentUser && req.currentUser.email )
			LoginToken.remove({ email: req.currentUser.email }, function() {});
		res.clearCookie('logintoken');
		req.session.destroy(function() {});
	  }
	res.redirect('/');
});




var GetMongooseErrorMessage = function( code )
{
	var ret = null;
	switch( code )
	{
		case 11000:
			ret = "Email has already been taken.";
			break;
	}
	return ret;
}


http.listen(3000, function(){
  console.log('listening on *:3000');
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