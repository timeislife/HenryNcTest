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


router.post('/uploadlogo',function(req,res){
     //var dirname = require('path').dirname(__dirname);
	 console.log("/uploadlogo");

     var filename = req.files.file.name;
     var path = req.files.file.path;
     var type = req.files.file.mimetype;
	 var originalname = req.files.file.originalname;
	 var mimetype = req.files.file.mimetype;

	 var filePath = path;
	 var metadataObj = {imageusage:"logo", oname:originalname,mtype:mimetype};
	 var conn = app.Mongoose.createConnection(app.set('server-name'), app.set('db-name'), 27017);

	app.AttchHelper.SaveFileWithMetadata( app.Mongoose, conn, app.Fs, filePath, filename, metadataObj, 
		function()
		{
		   console.log("upload successfully");
		   //res.redirect("/lawregulation2/" + req.params.id + "/edit?delayload=1");
		   res.json({"sucess":true});
		},
		function( err )
		{
		   res.json({"sucess":true, "error":err.message+":"+err.stack});
		   console.log(err.message+":"+err.stack);
		}
	);

});

//functions ----------------------------------------------

module.exports = router;