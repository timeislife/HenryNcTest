var express = require('express'),
    app = module.exports = express();
	http = require('http').Server(app);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/app.html');
});

app.get('/public/styles/app.css', function(req, res){
  res.sendFile(__dirname + '/public/styles/app.css');
});


app.get('/chat', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});