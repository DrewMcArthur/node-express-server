var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var names = new Array();
var numOfUsersOnline = 0;

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
	
	numOfUsersOnline++;
	socket.on('disconnect', function(){
		name = "A user";	//function doesn't have input yet for name
		var left = name + " left the chat.";
		io.emit('chat message', left);
		numOfUsersOnline--; //still need to remove name from names array
	});
	socket.emit('ask name');
	socket.on('answer name', function(name){
		var entered = name + " entered the chat!"; //a person just entered the chat
		names[names.length] = name + " "; //all names of people online
		var nOnline = numOfUsersOnline + " users are online."; // number of people online
		var uOnline = "Users " + names + " are online."; // users online
		io.emit('chat message', entered);
		socket.emit('chat message', nOnline);
		socket.emit('chat message', uOnline);
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




