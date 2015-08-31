Authentication module.

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