var User, 
	crypto = require('crypto');


function defineModels(mongoose, fn) {

	var Schema = mongoose.Schema;

	  /**
	  * Model: User
	  */
	  function validatePresenceOf(value) {
		return value && value.length;
	  }


	User = new Schema({
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

	User.method('makeSalt', function() {
		return Math.round((new Date().valueOf() * Math.random())) + '';
	});

	User.method('encryptPassword', function(password) {
		return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
	});

	mongoose.model('User', User);

	fn();
}

exports.defineModels = defineModels; 