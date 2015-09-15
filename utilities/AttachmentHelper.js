
/*
Usage:
 attchHelper = require('./utilities/AttachmentHelper');
 var id = req.params.id;
 var conn = mongoose.createConnection('localhost', 'KMSystem-DEV', 27017);
 conn.once('open', function () {
	 attchHelper.GetMetaTypeById(mongoose,conn, id, 
		 function(metatype)
		 {
			 console.log(metatype);
		 }
		 ,
		 function(err)
		 {
			console.log(err);
		 });
 });
*/
exports.GetMetaTypeById = function(mongoose, conn, idParam, successFun, failFunc) {
	var ObjectID  = mongoose.mongo.ObjectID;

	var Grid = require('gridfs-stream');
	Grid.mongo = mongoose.mongo;
	
	var gfs = Grid(conn.db);  
	//gfs.files.find({ 'metadata.lrid':  }).toArray(function (err, files) {
	gfs.files.findOne({ "_id" :new  ObjectID(idParam)},function (err, file) {
		//if (err) console.log(err);
		if (err) {failFunc(err);return;}
		
		var metatype = "";
		if( file && file.metadata && file.metadata.mtype )
		{
			metatype = file.metadata.mtype;
		}
		
		successFun(metatype);
			
	});
}


/*
Usage:
 attchHelper = require('./utilities/AttachmentHelper');
 var id = req.params.id;
 var conn = mongoose.createConnection('localhost', 'KMSystem-DEV', 27017);
 conn.once('open', function () {
	 attchHelper.GetMetaTypeById(mongoose,conn, id, 
		 function(metatype)
		 {
			 console.log(metatype);
		 }
		 ,
		 function(err)
		 {
			console.log(err);
		 });
 });
*/
exports.GetFileNameById = function(mongoose, conn, idParam, successFun, failFunc) {
	var ObjectID  = mongoose.mongo.ObjectID;

	var Grid = require('gridfs-stream');
	Grid.mongo = mongoose.mongo;
	
	var gfs = Grid(conn.db);  
	//gfs.files.find({ 'metadata.lrid':  }).toArray(function (err, files) {
	gfs.files.findOne({ "_id" :new  ObjectID(idParam)},function (err, file) {
		//if (err) console.log(err);
		if (err) {failFunc(err);return;}
		
		var filename = "";
		if( file && file.metadata && file.metadata.filename )
		{
			filename = file.metadata.filename;
		}
		
		successFun(filename);
			
	});
}


/*
Usaged to download file from GFS system with id and content-type.
Example:
	attchHelper = require('./utilities/AttachmentHelper');
	var metatype = "application/vnd.ms-excel";
	var id = req.params.id;
	var conn = mongoose.createConnection('localhost', 'KMSystem-DEV', 27017);
	attchHelper.RenderFileByIdWithMetaType( mongoose, conn, id, res, metatype
		function()
		{
			console.log("success");
		},
		function(err)
		{
			console.log(err);
		}
	);

*/
exports.RenderFileByIdWithMetaType = function(mongoose, conn, idParam, res, metatype,additainalHeader, successFun, failFunc) {
	var ObjectID  = mongoose.mongo.ObjectID;
	var GridStore = mongoose.mongo.GridStore;
    var gs = new GridStore(conn.db,new ObjectID(idParam), 'r');

   gs.open(function(err,gs){
	  if (err) 
	  {
		failFunc(err);
		return;
	  }
	  gs.read(function(error,data) {
		     if (error) failFunc(error);
			 if( additainalHeader ) 
		     {
				for(var prop in additainalHeader) {
				   // propertyName is what you want
				   // you can get the value like this: myObject[propertyName]
				   res.setHeader(prop, additainalHeader[prop]);
				}
			 }
			 if( metatype ) res.writeHead('200', {'Content-Type': metatype});
			 res.end(data,'binary');
			 successFun();
		 });
   });
}

/*
Save file to GridFS with metadatas
Example:
	attchHelper = require('./utilities/AttachmentHelper');
	var conn = mongoose.createConnection('localhost', 'KMSystem-DEV', 27017);
    var fs = require('fs');	
    var filePath = __dirname + '/' + req.files.file.path;
	var filename = "filename1";
	var metadataObj = {lrid:req.params.id, oname:"oldname.txt",mtype:"application/vnd.ms-excel"};
	
	attchHelper.SaveFileWithMetadata( mongoose, conn, fs, filePath, filename, metadataObj, 
		function()
		{
		   console.log("success!");
		},
		function( err )
		{
		   console.log(err);
		}
	);
*/
exports.SaveFileWithMetadata = function(mongoose, conn, fs, filePath, filenamePar, metadataObj, successFun, failFunc) {
     var read_stream =  fs.createReadStream(filePath);
	 
	 var Grid = require('gridfs-stream');
     Grid.mongo = mongoose.mongo;
		
	var date = new Date();
	console.log("start:" + date + ";million:" + date.getMilliseconds());

	var gfs = Grid(conn.db);
	var writestream = gfs.createWriteStream({
		filename: filenamePar,
		metadata:metadataObj
	});

	read_stream.pipe(writestream);
	
	read_stream.on('error', function (err) {
	  failFunc(err);
	});
	var date1 = new Date();
	console.log("end:" + date1 + ";million:" + date1.getMilliseconds());
	successFun()
}

/*
Delete a file from GridFS
NOTE: for options parameter, at least an _id or filename should be provided.
Example:
	attchHelper = require('./utilities/AttachmentHelper');
	var conn = mongoose.createConnection('localhost', 'KMSystem-DEV', 27017);

	attchHelper.DeleteFile( mongoose, conn, {"_id":"55f7870b6d2c236c25b34881"} , 
		function()
		{
		   console.log("success!");
		},
		function( err )
		{
		   console.log(err);
		}
	);
*/
exports.DeleteFile = function(mongoose, conn, options, successFun, failFunc) {
	var Grid = require('gridfs-stream');
	Grid.mongo = mongoose.mongo;

	var gfs = Grid(conn.db);
	gfs.remove(options, function (err) {
	  if (err) return failFunc(err);
	  successFun();
	});
}

/*
Get the attachments by metadata property.
Example:
	attchHelper = require('./utilities/AttachmentHelper');
   	var conn = mongoose.createConnection('localhost', 'KMSystem-DEV', 27017);
	var entityID = lawregulation._id.toString();
	attchHelper.GetAttachmentsByEntityIdInMetadata( mongoose, conn, entityID,
		function( files)
		{
		   console.log(files);
		},
		function(err)
		{
			console.log(err);
		}
	);

*/
exports.GetAttachmentsByEntityIdInMetadata = function(mongoose, conn, entityId, successFun, failFunc) {
	var Grid = require('gridfs-stream');
	Grid.mongo = mongoose.mongo;	
	conn.once('open', function () {
		var gfs = Grid(conn.db);  
		gfs.files.find({"metadata.lrid" : entityId.toString()}).toArray(function (err, files) {
			if (err) {failFunc(err); return;}
			successFun(files);
		});
	});
}

/*
Delete an attachment by file id.
Example:
	attchHelper = require('./utilities/AttachmentHelper');
   	var conn = mongoose.createConnection('localhost', 'KMSystem-DEV', 27017);
	attchHelper.DeleteAttachmentByID( mongoose, conn, fileID,
		function()
		{
		   console.log("success");
		},
		function(err)
		{
			console.log(err);
		}
	);

*/
exports.DeleteAttachmentByID = function(mongoose, conn, fileID, successFun, failFunc) {
	var Grid = require('gridfs-stream');
	var ObjectID  = mongoose.mongo.ObjectID;
	Grid.mongo = mongoose.mongo;	
	conn.once('open', function () {
		var gfs = Grid(conn.db);  
		var options = {"_id": new ObjectID(fileID.toString())}
		gfs.remove(options, function (err) {
		  if (err) {failFunc(err); return;}
		  successFun();
		});
	});
}





