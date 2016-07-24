var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var status = false;

app.use(express.static(__dirname + '/public'));//this hosts the files located in the ./public directory

app.get('/howto',function(req, res){
	res.send(__dirname + '/public/howto/index.html');
});

io.on('connection',function(socket){
	//console.log("\nINCOMING CONNECTION\n************************");
	//console.log(socket);
	//tell the client if the bridge is open or not
	socket.emit('update',status);

	//when the town updates the status from the admin tab
	socket.on('admin-update',function(data){
		console.log('admin-update');
		if(data.pw == 3556498){
			status = data.stat;
			//tell everyone else who's connected
			io.emit('update',status);
			socket.emit('correct-pass');
		} else {
			socket.emit('incorrect-pass');
		}
	});
});

http.listen(80, function(){ //listen for requests at ipaddress:1337
	console.log("Server is running on port 80");
});
