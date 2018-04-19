var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var stream = require('stream');
var liner = new stream.Transform( { objectMode: true } );

// host all files in ./public
app.use(express.static(__dirname + '/public')); 

// io refers to the server object. 
// socket is an individual connection.  
// io.on('connection', ... is the server listening for a socket to connect to it
// when that happens, the callback is run. 
// the socket variable then refers to this connection.
// the io object can still be accessed, 
// io.emit('msgtype', 'msg') sends a message msg to all of its sockets.
// or the socket can be targeted directly.  
// socket.emit('msgtpe', 'msg') by sending it a message
// socket.on('msgtype', function(msg) { ... or by listening for a message.

// when a socket is opened, on connection event
io.on('connection', function(socket)
{ 
  //logs all connection information
	//console.log(socket); 
	
  //ip address of client
	var address = socket.handshake.address; 
	logger(serverMessage(address));
	
	socket.emit('welcome', 'Hey, thanks for connecting!');

  // all of the other sockets, and not itself.
  io.emit('new user', 'A new user connected!');

  // when the client responds, 
	socket.on('btn press', function(msg)
  { 
    io.emit('btn press', 'a user pressed the button!');
	});

  //when the client disconnects from the server, 
	socket.on('disconnect', function()
  { 
    // note that a user disconnected
		logger(serverMessage('user disconnected.')); 
	});

});

// take a string, and turn it into an object that appears to be made by the server
function serverMessage(msgBody)
{ 
	msgFromServer = {
		name:"Server",
		timestamp:(new Date()).toLocalString(),
		body:msgBody
	};
	return msgFromServer;
}

//log to the console and a hard file
function logger(message)
{ 
	console.log(message);
	fs.appendFile(
		__dirname + "/messages.log", 
		message.timestamp + "	" + message.name + "	" + message.body + "\n", 
		function(err)
    { 
			if(err) { console.log(err); } 
		}
	);
}

//listen for requests at ipaddress:80
http.listen(80, function()
{ 
  //callback function, completely optional.
	logger(serverMessage('Server is running on port 80'));  
});

