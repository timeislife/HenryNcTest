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

/*
	Gets a entity in a collection by ID.
	Example:
	var mongoHelper = require('./utilities/MongooseHelper');
	var id = req.params.id;
	mongoHelper.GetEntityByID( mongoose, "LawRegulation", id, 
		function(entity)
		{
			console.log(entity);
		}
		function(err)
		{
			console.log(err);
		}
	);
	  
*/
exports.GetEntityByID = function(mongoose, collectionName, idPar, successFun, failFunc)
{
	mongoose.model(collectionName).findById(idPar, function (err, entity) {
		if (err) {
			failFunc(err);
		} 
		else {
			successFun(entity);
		}
	});
}



/*
	Gets all db names.
	Example:
	var mongoHelper = require('./utilities/MongooseHelper');
	mongoHelper.GetAllDbs( mongoose, app.set("db-uri"),
		function(dbs)
		{
			console.log(dbs);
			
			//  dbs is in the following format:
			//	[ { name: 'db1', sizeOnDisk: 83886080, empty: false },
			//	  { name: 'db2', sizeOnDisk: 2097152000, empty: false },
			//	  { name: 'db3', sizeOnDisk: 83886080, empty: false } ]
		}
		function(err)
		{
			console.log(err);
		}
	);
	  
*/
exports.GetAllDbs = function(mongoose, dbUri, successFun, failFunc)
{
	var MongoClient = mongoose.mongo.MongoClient;
    MongoClient.connect(dbUri, function(err, db) {
		if( err ) {failFunc(err); return; }
		// Use the admin database for the operation
		var adminDb = db.admin();
		
		 // List all the available databases
		 adminDb.listDatabases(function(err, dbs) {
		   if( err ) {failFunc(err); return; }
		   successFun( dbs.databases );
		   db.close();
		 });
   });
}


/*
	Gets all collections in a database.
	Example:
	var mongoHelper = require('./utilities/MongooseHelper');
	mongoHelper.GetAllCollections( mongoose, app.set("db-uri"),"test1",
		function(cols)
		{
			console.log(cols);
		}
		function(err)
		{
			console.log(err);
		}
	);
	  
*/
exports.GetAllCollections = function(mongoose, dbUri, dbName, successFun, failFunc)
{
	var pos1 = dbUri.lastIndexOf("/");
	var rootUri = dbUri.substr( 0, pos1 );
	var newDbUri = rootUri + "/" + dbName;
	var connection = mongoose.createConnection(newDbUri);
	connection.db.open( function(err){
		if( err ) {  failFunc(err); return; }
		connection.db.collections(function(error, names) {
			if (error) {
			  failFunc(error);
			  return;
			} else {
			  successFun(names);
			}
		  });
	});
}


/*
	Gets all collections in a database.
	Example:
	var mongoHelper = require('./utilities/MongooseHelper');
	mongoHelper.GetAllCollections( mongoose, app.set("db-uri"),"test1", "collection1",
		function(records)
		{
			console.log(records);
		}
		function(err)
		{
			console.log(err);
		}
	);
	  
*/
exports.FindAllRecords = function(mongoose, dbUri, dbName, collectionName, successFun, failFunc)
{
	var pos1 = dbUri.lastIndexOf("/");
	var rootUri = dbUri.substr( 0, pos1 );
	var newDbUri = rootUri + "/" + dbName;
	var connection = mongoose.createConnection(newDbUri);
	connection.db.open( function(err){
		if( err ) {  failFunc(err); return; }

		var coll = connection.db.collection(collectionName)
		coll.find().toArray(function(err, records) {
			if( err ) {  failFunc(err); return; }
			successFun( records );
		}); 
	});
}

/*
	Gets all collections in a database.
	Example:
	var mongoHelper = require('./utilities/MongooseHelper');
	

	mongoHelper.UpdateRecord( mongoose, app.set("db-uri"),"test1", "collection1",
		{ "_id.name": "Robert Frost", "_id.uid": 0 }, //query
		{ "categories": ["poet", "playwright"] },   //update
		{ upsert: true }  //options
	);
	  
*/
exports.UpdateRecord = function(mongoose, dbUri, dbName, collectionName, query, update, options, successFunc, failFunc)
{
	var pos1 = dbUri.lastIndexOf("/");
	var rootUri = dbUri.substr( 0, pos1 );
	var newDbUri = rootUri + "/" + dbName;
	var connection = mongoose.createConnection(newDbUri);
	connection.db.open( function(err){
		if( err ) {  failFunc(err); return; }
		var coll = connection.db.collection(collectionName)
		coll.update(  query, update, options );
		successFunc();
	});
}



exports.QueryARecord = function(mongoose, dbUri, dbName, collectionName, query, projections,  successFunc, failFunc)
{
	var pos1 = dbUri.lastIndexOf("/");
	var rootUri = dbUri.substr( 0, pos1 );
	var newDbUri = rootUri + "/" + dbName;
	var connection = mongoose.createConnection(newDbUri);
	connection.db.open( function(err){
		if( err ) {  failFunc(err); return; }
		var coll = connection.db.collection(collectionName)
		var cursor = coll.findOne(  query, projections ,function(err,obj)
		{
			if( err ) failFunc(err);
			successFunc(obj);
		});		
	});
}


exports.QueryRecords = function(mongoose, dbUri, dbName, collectionName, query, projections,  successFunc, failFunc)
{
	var pos1 = dbUri.lastIndexOf("/");
	var rootUri = dbUri.substr( 0, pos1 );
	var newDbUri = rootUri + "/" + dbName;
	var connection = mongoose.createConnection(newDbUri);
	connection.db.open( function(err){
		if( err ) {  failFunc(err); return; }
		var coll = connection.db.collection(collectionName);

		coll.find(query,projections).toArray(function(err, records) {
			if( err ) {  failFunc(err); return; }
			successFunc( records );
		}); 
	});
}


/*
	Gets all collections in a database.
	Example:
	var mongoHelper = require('./utilities/MongooseHelper');
	

	mongoHelper.InsertRecord( mongoose, app.set("db-uri"),"test1", "collection1",
		{ "field 1": "value1", "field 2": "value2" },
		function()
		{
			console.log("success");
		},
		function( err )
		{
			console.log("error");
		}
	);
	  
*/
exports.InsertRecord = function(mongoose, dbUri, dbName, collectionName, doc, successFun, failFunc)
{
	var pos1 = dbUri.lastIndexOf("/");
	var rootUri = dbUri.substr( 0, pos1 );
	var newDbUri = rootUri + "/" + dbName;
	var connection = mongoose.createConnection(newDbUri);
	connection.db.open( function(err){
		if( err ) {  failFunc(err); return; }
		var coll = connection.db.collection(collectionName)
		coll.insert(  doc, function(err, result)
		{
			if( err ) failFunc(err);
			successFun(result); //result example: {"ok":1,"n":1}
		});
		
	});
}



/*
	Gets all collections in a database.
	Example:
		
		mongoHelper.FindAllRecordsWithProjections( mongoose, app.set("db-uri"), app.set('db-name') , app.set('collection-name'), {_id:1,Form:1},
			function(records)
			{
				  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
				  res.format({
						//HTML response will render the index.jade file in the views/blobs folder. We are also setting "blobs" to be an accessible variable in our jade view
						html: function(){
							//only support json
						},
						//JSON response will show all law regulations in JSON format
						json: function(){
							res.json(records);
						}
				  });
			},
			function(err)
			{
				console.log(err);
			}
		);
	  
*/
exports.FindAllRecordsWithProjections = function(mongoose, dbUri, dbName, collectionName, projections, successFun, failFunc)
{
	var pos1 = dbUri.lastIndexOf("/");
	var rootUri = dbUri.substr( 0, pos1 );
	var newDbUri = rootUri + "/" + dbName;
	var connection = mongoose.createConnection(newDbUri);
	connection.db.open( function(err){
		if( err ) {  failFunc(err); return; }

		var coll = connection.db.collection(collectionName)
		coll.find({},projections).toArray(function(err, records) {
			if( err ) {  failFunc(err); return; }
			successFun( records );
		}); 
	});
}


exports.FindAllRecordsWithProjectionsWithSort = function(mongoose, dbUri, dbName, collectionName, projections, sortby, successFun, failFunc)
{
	var pos1 = dbUri.lastIndexOf("/");
	var rootUri = dbUri.substr( 0, pos1 );
	var newDbUri = rootUri + "/" + dbName;
	var connection = mongoose.createConnection(newDbUri);
	connection.db.open( function(err){
		if( err ) {  failFunc(err); return; }

		var coll = connection.db.collection(collectionName)
		coll.find({},projections).sort(sortby).toArray(function(err, records) {
			if( err ) {  failFunc(err); return; }
			successFun( records );
		}); 
	});
}

/*
	Gets a entity in a collection by ID.
	Example:
	var mongoHelper = require('./utilities/MongooseHelper');
	var id = req.params.id;
	mongoHelper.GetEntityByID( mongoose, "LawRegulation", id, 
		function(entity)
		{
			console.log(entity);
		}
		function(err)
		{
			console.log(err);
		}
	);
	  
*/
exports.GetEntityByID = function(mongoose, dbUri, dbName, collectionName, idPar, successFun, failFunc)
{
	var pos1 = dbUri.lastIndexOf("/");
	var rootUri = dbUri.substr( 0, pos1 );
	var newDbUri = rootUri + "/" + dbName;
	var connection = mongoose.createConnection(newDbUri);
	connection.db.open( function(err){
		if( err ) {  failFunc(err); return; }

		var coll = connection.db.collection(collectionName)
		coll.find({_id:idPar}).toArray(function(err, records) {
			if( err ) {  failFunc(err); return; }
			successFun( records[0] );
		});  
	});
}


/*
	Removes a entity in a collection by ID.
	Example:
	var mongoHelper = require('./utilities/MongooseHelper');
	var id = req.params.id;
	mongoHelper.GetEntityByID( mongoose, "LawRegulation", id, 
		function()
		{
			console.log("success!");
		}
		function(err)
		{
			console.log(err);
		}
	);
	  
*/
exports.RemoveEntityByID = function(mongoose, dbUri, dbName, collectionName, idPar, successFun, failFunc)
{
	var pos1 = dbUri.lastIndexOf("/");
	var rootUri = dbUri.substr( 0, pos1 );
	var newDbUri = rootUri + "/" + dbName;
	var connection = mongoose.createConnection(newDbUri);
	connection.db.open( function(err){
		if( err ) {  failFunc(err); return; }

		var coll = connection.db.collection(collectionName)
		coll.remove({_id:idPar});
		successFun();
	});
}



exports.GetEntityByID_Old = function(mongoose, collectionName, idPar, successFun, failFunc)
{
	mongoose.model(collectionName).findById(idPar, function (err, entity) {
		if (err) {
			failFunc(err);
		} 
		else {
			successFun(entity);
		}
	});
}
