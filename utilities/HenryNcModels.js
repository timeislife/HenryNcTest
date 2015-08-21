/*
Example:
var henryNcModels = require("./HenryNcModels");
var User = henryNcModels.User;
var LoginToken = henryNcModels.User;
User.findOne......

*/

var mongoose = require('mongoose'),
    models = require('./models'),
	config = require('./config');

exports = module.exports = InitModels;

function InitModels()
{
   var model = {};
   models.defineModels(mongoose, function() {
	  model.User = User = mongoose.model('User');
	  model.LoginToken = LoginToken = mongoose.model('LoginToken');
	  mongoose.connect(config.dbUri);
   });
	
   return model;
}
