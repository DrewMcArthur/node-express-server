var express = require('express');
var app = express();

app.get('/', function(req, res){		//when someone loads '/' (the home page) 
  res.sendFile(__dirname + '/index.html');		//then send them the file located at '/index.html'.  
	console.log('Someone loaded \'/\'!');
});

app.listen(1337, function(){ //listen for requests at ipaddress:1337
	console.log("Server is running on port 1337");		//callback function, completely optional.
});
