/*
Gets authentication models with database connected.
Example:
var HenryNcModels = require("./HenryNcModels");
var db_uri = "mongodb://localhost/henrynctest-production";
var authModels = require("./Models/authentication/models")(db_uri)).InitModels();
var User = authModels.User;
var LoginToken = authModels.LoginToken;
User.findOne......

*/

var mongoose = require('mongoose'),
	crypto = require('crypto');


module.exports = function(db_uri) {

  return {
    InitModels: function() {
	   var model = {};
	   defineModels(mongoose, function() {
		  model.User = mongoose.model('User');
		  model.LoginToken = mongoose.model('LoginToken');
		  mongoose.connect(db_uri);
	   });
	   return model;
    }
  };
  
}


  function defineModels(mongoose, fn)
  {
  	 var Schema = mongoose.Schema;
	

	  /**
	  * Model: User
	  */
	  function validatePresenceOf(value) {
		return value && value.length;
	  }


	var User = new Schema({
	'email': { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
	'hashed_password': String,
    'salt': String,
	'created':{ type: Date, default: Date.now }
	});

	User.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

	User.virtual('password')
    .set(function(password) {
      this._password = password;
      this.salt = this.makeSalt();
      this.hashed_password = this.encryptPassword(password);
    })
    .get(function() { return this._password; });


	User.method('authenticate', function(plainText) {
		return this.encryptPassword(plainText) === this.hashed_password;
	});

	User.method('makeSalt', function() {
		return Math.round((new Date().valueOf() * Math.random())) + '';
	});


	User.method('encryptPassword', function(password) {
		return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
	});

	 User.pre('save', function(next) {
		if (!validatePresenceOf(this.password)) {
		  next(new Error('Invalid password'));
		} else {
		  next();
		}
	});


  /**
    * Model: LoginToken
    *
    * Used for session persistence.
    */
  var LoginToken = new Schema({
    email: { type: String, index: true },
    series: { type: String, index: true },
    token: { type: String, index: true }
  });

  LoginToken.method('randomToken', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  });

  LoginToken.pre('save', function(next) {
    // Automatically create the tokens
    this.token = this.randomToken();

    if (this.isNew)
      this.series = this.randomToken();

    next();
  });

  LoginToken.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  LoginToken.virtual('cookieValue')
    .get(function() {
      return JSON.stringify({ email: this.email, token: this.token, series: this.series });
    });


	mongoose.model('User', User);
	mongoose.model('LoginToken', LoginToken);

	fn();
  }
