exports.GetMongooseErrorMessageFromCode = function(code) {
		var ret = null;
		switch( code )
		{
			case 11000:
				ret = "Email has already been taken.";
				break;
		}
		return ret;
}