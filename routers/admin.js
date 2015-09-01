var express = require('express');
var router = express.Router();
var app = require("../app");


// middleware specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Admin router, Time: ', Date.now());
  next();
});

// define the home page route
router.get('/', function(req, res,next) {
	app.set('AuthUtilities').loadUser(req,res,next);
    res.render('admin/index.jade', {
		reqA:req
  });
});



//functions ----------------------------------------------

module.exports = router;