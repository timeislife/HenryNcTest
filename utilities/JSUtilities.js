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