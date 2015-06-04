function defineModels(mongoose, fn) {

	var Schema = mongoose.Schema;

	  /**
	  * Model: User
	  */
	  function validatePresenceOf(value) {
		return value && value.length;
	  }

	var User;

	User = new Schema({
	'email': { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
	'password': String
	});

	mongoose.model('User', User);

	fn();
}

exports.defineModels = defineModels; 