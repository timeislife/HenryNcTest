/*
	Sort the order of an object's properties by the property name.

	Example:
	var jsUtil = require('./utilities/JSUtilities');
	var	obj = {
		method: 'artist.getInfo',
		artist: 'Green Day',
		format: 'json',
		api_key: 'fa3af76b9396d0091c9c41ebe3c63716'
		};
	
	var retObj = jsUtil.SortObjByPropertyName( obj );

----------------------------------------
	retObj:
	{
		api_key: 'fa3af76b9396d0091c9c41ebe3c63716',
		artist: 'Green Day',
		format: 'json',
		method: 'artist.getInfo'
	}
-----------------------------------------

if wants to sort desendingly, use false for the second parameter,
if do not want to sort array elements for the property values, use false for the third parameter.
	  
*/
exports.SortObjByPropertyName = function(obj, asending, sortSub)
{
	asending = typeof asending !== 'undefined' ? asending : true;
	sortSub = typeof sortSub !== 'undefined' ? sortSub : true;

	var sorted = {}, key, a = [];

    for (key in obj) {
    	if (obj.hasOwnProperty(key)) {
    		a.push(key);
    	}
    }

	//asending or desending.
	if( asending ) a.sort();
	else a.sort(function(a, b){return b-a});

    for (key = 0; key < a.length; key++) {
		var subObj = obj[a[key]];
		if( sortSub && subObj && Array.isArray(subObj )  )
		{
			if( asending )
			{
				subObj.sort();
			}
			else
			{
				subObj.sort(function(a, b){return b-a});
			}
		}
    	sorted[a[key]] = obj[a[key]];
    }
    return sorted;
}

/*
Adds a child node at the specified position to a JSON object.
Parameters:
	jsonObj: json object to which the child node will be added. 
	nodeText: "text" property of the node to which the child node will be added. 
	childObj: the object to be added to the jsonObj as a child. 
	position: the position after which the child object will be added. 
Example: 
	var jsUtil = require('./utilities/JSUtilities');
	var jsonObj = {"text":"Root"};
	var nodeText = "Root";
	var childObj = {"text","child 1"};
	var result = jsUtil.AddChildToJsonNode( jsonObj, nodeText, childObj, 0 );


	result: {"text":"Root", children: [{"text","child 1"}]}

*/
exports.AddChildToJsonNode( jsonObj, nodeText, childObj, position )
{
	if( jsonObj["text"] == nodeText )
	{
		if( !jsonObj["children"] )
		{
			jsonObj["children"] = [];
		}	
		position = jsonObj["children"].length < position? jsonObj["children"].length : position;
		jsonObj["children"].splice(position, 0, childObj);
		return jsonObj;
	}
	else
	{
		if( jsonObj["children"] )
		{
			for( i = 0 ; i < jsonObj["children"].length; i++ )
			{
				jsonObj["children"][i]  = AddChildToJsonNode( jsonObj["children"][i], nodeText, childObj, position );
			}
		}
		return jsonObj;
	}	
}