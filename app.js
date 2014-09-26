var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));//this hosts the files located in the ./public directory

app.listen(1337, function(){ //listen for requests at ipaddress:1337
	console.log("Server is running on port 1337");		//callback function, completely optional.
});
