var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


io.on('connection', function(socket){
	console.log('connected');
	socket.on('msgr',function(socket){
		io.emit('msgs', msg);
		console.log(msg);
	});
});

app.use(express.static(__dirname + '/public'));

http.listen(1337, function(){ //listen for requests at ipaddress:1337
	console.log("Server is running on port 1337");		//callback function, completely optional.
});
