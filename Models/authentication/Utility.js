/*
Authentication utility class.
Example:

var db-uri = "mongodb://localhost/henrynctest-production";
var authModels = require("./Models/authentication/models")(app.set('db-uri')).InitModels();
var User = authModels.User;
var LoginToken = authModels.LoginToken;

var authUtilities = require("./Models/authentication/utility")(authModels);

-------------------------------------------------------
app.get('/', authUtilities.loadUser, function(req, res){
    res.render('index.jade', {
		reqA:req
  });
});
--------------------------------------------------------
or 

-------------------------------------------------------
var accessDeniedUrl = '/sessions/new';
app.get('/',function(req,res,next)
{
	authUtilities.loadUser( req,res,next, accessDeniedUrl );
}
, function(req, res){
    res.render('index.jade', {
		reqA:req
  });
});
----------------------------------------------------------

*/

var Models;
var defaultAccessDeniedUrl = '/sessions/new';

module.exports = function(models) {
  Models = models;

  return {
    authenticateFromLoginToken: AuthenticateFromLoginToken,
    loadUser: LoadUser

}

function AuthenticateFromLoginToken(req, res, next, accessDeniedUrl) {
	  if( !accessDeniedUrl ) accessDeniedUrl = defaultAccessDeniedUrl;
	  var cookie = JSON.parse(req.cookies.logintoken);

	  Models.LoginToken.findOne({ email: cookie.email,
						   series: cookie.series,
						   token: cookie.token }, (function(err, token) {
		if (!token) {
		  res.redirect(accessDeniedUrl);
		  return;
		}

		Models.User.findOne({ email: token.email }, function(err, user) {
		  if (user) {
			req.session.user_id = user.id;
			req.currentUser = user;

			token.token = token.randomToken();
			token.save(function() {
			  res.cookie('logintoken', token.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
			  next();
			});
		  } else {
			res.redirect(accessDeniedUrl);
		  }
		});
	  }));
}


function LoadUser(req, res, next, accessDeniedUrl)
{
  if( !accessDeniedUrl ) accessDeniedUrl = defaultAccessDeniedUrl;

  if (req.session.user_id) {
	Models.User.findById(req.session.user_id, function(err, user) {
	  if (user) {
		req.currentUser = user;
		req.session.user_id = user.id;
		req.session.email = user.email; 
		next();
	  } else {
		res.redirect(accessDeniedUrl);
	  }
	});
  } else if (req.cookies.logintoken) {
	 AuthenticateFromLoginToken(req, res, next);
  } else {
	res.redirect(accessDeniedUrl);
  }
}
};