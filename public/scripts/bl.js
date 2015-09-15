function RenderHeaderLogo(imgID)
{
	$.ajax({
		type: "GET",
		url: "/header-logo-id",
		dataType: "json",
		async: false,
		success: function (data) {
			var json = eval(data);
			if( json && json.success && json.logoid )
			{
				if( json.logoid == "000000000000000000000000" )
				{
					$("#" + imgID).attr("src", "");
					$("#" + imgID).attr("src", "/public/images/nologo.png");
				}
				else
				{
					$("#" + imgID).attr("src", "");
					$("#" + imgID).attr("src", "/imageapi/" + json.logoid );					
				}
			}
		},
		error: function (err) {
			alert(err.responseText)
		}
	});
}