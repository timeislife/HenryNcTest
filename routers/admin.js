var express = require('express');
var router = express.Router();
var app = require("../app");


// middleware specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Admin router, Time: ', Date.now());
  next();
});

// define the home page route
router.get('/', function(req,res,next){
		app.AuthUtilities.loadUser(req,res,next);
	},
	function(req, res,next) {
	
    res.render('admin/index.jade', {
		reqA:req
  });
});


router.get('/general', function(req,res,next){
		app.AuthUtilities.loadUser(req,res,next);
	},
	function(req, res,next) {
	
	app.MongoHelper.QueryARecord( app.Mongoose, app.set('db-uri'), app.set('db-name') , "configurations", {"key":"general"}, {}, 
			function(entity)
			{
				if( !entity ) entity = {};
				//console.log('GET general setting ID: ' + entity._id);
				 res.render('admin/general.jade', {
					reqA:req,
					settings:entity
				});
			},
			function(err)
			{
				logger.error(err.message+":"+err.stack);
			}
		);

});


router.post('/general', function(req, res) {
  var siteName =  req.body.site_name;

app.MongoHelper.UpdateRecord( app.Mongoose, app.set('db-uri'), app.set('db-name') , "configurations", 
	{ "key": "general" }, //query
	{ "key": "general", "site_name": siteName },   //update
	{ upsert: true },  //options
	function()
	{
		console.log("update success");
		res.redirect('/admin/general');
	},
	function(err)
	{
		console.log(err);
	}
);

});


//functions ----------------------------------------------

module.exports = router;