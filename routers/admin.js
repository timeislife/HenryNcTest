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
	
    res.render('admin/general.jade', {
		reqA:req
  });
});


router.post('/general', function(req, res) {
  var user = new User(req.body.user);
});


//functions ----------------------------------------------

module.exports = router;