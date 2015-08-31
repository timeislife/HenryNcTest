var express = require('express');
var router = express.Router();

var HenryNcModels = require("../Utilities/HenryNcModels");
var db_uri = "mongodb://localhost/henrynctest-production";
var henryNcModels = HenryNcModels(db_uri).InitModels();
var User = henryNcModels.User;

var HenryNcUtilities = require("../Utilities/Utilities");
var henryNcUtilities = HenryNcUtilities(henryNcModels);

// middleware specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Admin router, Time: ', Date.now());
  next();
});

// define the home page route
router.get('/', henryNcUtilities.loadUser, function(req, res) {
    res.render('admin/index.jade', {
		reqA:req
  });
});



//functions ----------------------------------------------

module.exports = router;