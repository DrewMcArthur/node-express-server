var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');
var stream = require('stream');
var liner = new stream.Transform( { objectMode: true } );

app.use(express.static(__dirname + '/public')); // allow access to all files in ./public

http.listen(80, function(){ //listen for requests at ipaddress:80
	console.log('Server is running on port 80');  //callback function, completely optional.
});
