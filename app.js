var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){		//when someone loads '/' (the home page) 
	res.sendFile(__dirname + '/index.html');		//then send them the file located at '/index.html'.  
	console.log('Someone loaded \'/\'!');
});

app.get('/chat', function(req,res){
	res.sendFile(__dirname + '/chat.html');
	console.log('Someone loaded the chat!');
});

app.get(/^\/name\/(\w+)(?:\.\.(\w+))?$/, function(req, res){
	var name = req.params[0];
	console.log(name);
	res.send('Hello ' + name);
});

app.listen(1337, function(){ //listen for requests at ipaddress:1337
	console.log("Server is running on port 1337");		//callback function, completely optional.
});
