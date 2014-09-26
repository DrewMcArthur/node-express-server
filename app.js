var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var name1;

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
        socket.on('chat message', function(msg){
		var nameMsg = name1 + ": " + msg;
                io.emit('chat message', nameMsg);
        });
	console.log('connection made');
	socket.emit('ask name');
	socket.on('answer name', function(name){
		name1 = name;
	});
});

http.listen(1337, function(){ //listen for requests at ipaddress:1337
	console.log("Server is running on port 1337");		//callback function, completely optional.
});




