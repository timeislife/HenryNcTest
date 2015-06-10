var express = require('express'),
    app = module.exports = express(),
	jade = require('jade'),
	models = require('./models'),
	mongoose = require('mongoose'),
	User,
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
  db = mongoose.connect(app.set('db-uri'));
})

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

app.get('/', function(req, res){
  //res.sendFile(__dirname + '/app.html');
   console.log( JSON.stringify( session ) );
    res.render('index.jade', {
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
	  message: {'type':'danger','message':message}
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
			 message: {'type':'warning','message':'Your account has been created'}
		});
        //res.redirect('/');
    }

  });

});

app.get('/logout',loadUser,function(req, res) {
	if (req.session) {
		req.session.destroy(function() {});
	  }
	res.redirect('/sessions/new');
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

function loadUser(req, res, next) {
  if (req.session.user_id) {
    User.findById(req.session.user_id, function(err, user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        res.redirect('/sessions/new');
      }
    });
  } else {
    res.redirect('/sessions/new');
  }
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