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


router.get('/menu', function(req,res,next){
		app.AuthUtilities.loadUser(req,res,next);
	},
	function(req, res,next) {
	
	app.MongoHelper.QueryARecord( app.Mongoose, app.set('db-uri'), app.set('db-name') , "configurations", {"key":"menu"}, {}, 
			function(entity)
			{
				if( !entity ) entity = [{text:"Site"}];
				res.format({
					html: function() {
						//console.log('GET general setting ID: ' + entity._id);
						 res.render('admin/menu.jade', {
							reqA:req,
							menusettings:entity
						});
					},
					json: function()
					{
						res.json(entity);
					}
				});
			},
			function(err)
			{
				logger.error(err.message+":"+err.stack);
			}
		);

});

router.get('/menujson', function(req,res,next){
		app.AuthUtilities.loadUser(req,res,next);
	},
	function(req, res,next) {
	
	app.MongoHelper.QueryARecord( app.Mongoose, app.set('db-uri'), app.set('db-name') , "configurations", {"key":"menu"}, {}, 
			function(entity)
			{
				if( !entity ) entity = [{text:"Site"}];
				res.json(entity);
			},
			function(err)
			{
				logger.error(err.message+":"+err.stack);
			}
		);

});

//TODO: here
router.post('/menu/createnode', function(req, res) {
	 var newNodeInfo = JSON.parse(req.body.data);

});


router.post('/general', function(req, res) {
  var siteName =  req.body.site_name;
  var headerRightContent = req.body.header_right_content

	app.MongoHelper.UpdateRecord( app.Mongoose, app.set('db-uri'), app.set('db-name') , "configurations", 
		{ "key": "general" }, //query
		{ "key": "general", "site_name": siteName, "header_right_content": headerRightContent },   //update
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


router.post('/uploadlogo',function(req,res,next){
     //var dirname = require('path').dirname(__dirname);
	 console.log("/uploadlogo");

     var filename = req.files.file.name;
     var path = req.files.file.path;
     var type = req.files.file.mimetype;
	 var originalname = req.files.file.originalname;
	 var mimetype = req.files.file.mimetype;

	 var filePath = path;
	 var metadataObj = {imageusage:"logo", oname:originalname,mtype:mimetype};

	 DeleteOldHeaderLogos( 
		function(){
			app.AttchHelper.SaveFileWithMetadata( app.Mongoose, app.Conn, app.Fs, filePath, filename, metadataObj, 
				function()
				{
				   console.log("upload successfully");
				   res.json({"sucess":true});
				},
				function( err )
				{
				   res.json({"sucess":true, "error":err.message+":"+err.stack});
				   console.log(err.message+":"+err.stack);
				}
			);

	    }, 
		function(err)
		{
			console.log(err);
			res.json({"sucess":true, "error":err.message+":"+err.stack});
		}
	 );


});

function DeleteOldHeaderLogos(successFunc, failFunc)
{
	//delete previous logo files.
	app.MongoHelper.QueryRecords( app.Mongoose, app.Conn , "fs.files",  
		{"metadata.imageusage":"logo"}, //query
		{}, 
		function(coll)
		{  
			console.log(coll.length);
			if( coll.length == 0 ) successFunc();
			for (i = 0; i < coll.length; i++) { 
				var doc = coll[i];
				app.AttchHelper.DeleteFile(  app.Mongoose, app.Conn, {"_id": doc._id}, 
					function()
					{
						console.log("success to delete previous logo:" + doc._id );	
						if( i >= coll.length - 1 )
						{	
							successFunc();
						}
					}, 
					function(err)
					{
						console.log(err);
						failFunc(err);
					}
				);
			}
		},
		function(err)
		{
			console.log(err);
			failFunc(err);
		}
	);

}



//functions ----------------------------------------------

module.exports = router;