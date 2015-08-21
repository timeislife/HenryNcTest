var express = require('express');
var router = express.Router();

// middleware specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Admin router, Time: ', Date.now());
  next();
});
// define the home page route
router.get('/', function(req, res) {
    res.render('admin/index.jade', {
		reqA:req
  });
});

/*
// define the about route
router.get('/Contact', function(req, res) {
  res.send('About -> Contact');
});
*/

module.exports = router;