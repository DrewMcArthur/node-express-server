var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
	console.log('connection made');
  socket.on('disconnect', function(){
		var name = "A user";	//function doesn't have input yet for name
		var left = name + " left the chat.";
		io.emit('chat message', left);
  });
	socket.emit('ask name');
	socket.on('answer name', function(name){
		var entered = name + " entered the chat!";
		io.emit('chat message', entered);
	});
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});
	socket.on('typing check', function(name){
		io.emit('typing', name);
	});
});

http.listen(1337, function(){ //listen for requests at ipaddress:1337
	console.log("Server is running on port 1337");		//callback function, completely optional.
});




