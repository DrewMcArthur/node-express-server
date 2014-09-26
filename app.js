var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get(/^\/name\/(\w+)(?:\.\.(\w+))?$/, function(req, res){
	var name = req.params[0];
	console.log(name);
	res.send('Hello ' + name);
});

app.listen(1337, function(){ //listen for requests at ipaddress:1337
	console.log("Server is running on port 1337");		//callback function, completely optional.
});
