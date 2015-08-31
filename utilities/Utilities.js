/*
Common functions.
Example:
var HenryNcModels = require("./HenryNcModels");
var db-uri = "mongodb://localhost/henrynctest-production";
var henryNcModels = HenryNcModels(db-uri).InitModels();

var HenryNcUtilities = require("./HenryNcUtilities");
var henryNcUtilities = HenryNcUtilities(henryNcModels);
henryNcUtilities.authenticateFromLoginToken(req, res, next);

*/

var Models;

module.exports = function(models) {
  Models = models;

  return {
    authenticateFromLoginToken: AuthenticateFromLoginToken,
    loadUser: LoadUser

}

function AuthenticateFromLoginToken(req, res, next) {
		  var cookie = JSON.parse(req.cookies.logintoken);

		  Models.LoginToken.findOne({ email: cookie.email,
							   series: cookie.series,
							   token: cookie.token }, (function(err, token) {
			if (!token) {
			  res.redirect('/sessions/new');
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
				res.redirect('/sessions/new');
			  }
			});
		  }));
    }


function LoadUser(req, res, next)
{
  if (req.session.user_id) {
	Models.User.findById(req.session.user_id, function(err, user) {
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
	 AuthenticateFromLoginToken(req, res, next);
  } else {
	res.redirect('/sessions/new');
  }
}
};