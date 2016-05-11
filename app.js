var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');
var stream = require('stream');
var liner = new stream.Transform( { objectMode: true } );

app.use(express.static(__dirname + '/public')); // allow access to all files in ./public

app.get('/download', function(req, res){
	//count number of downloads in file
	var counter = __dirname + '/public/dlnum.txt';
	var n = fs.readFileSync(counter, 'utf-8').match(/\d+/)[0];
	n++;
	fs.writeFile(counter, n, function(err){
		if (err) throw err;
	});

	//download the zip file
	var dlfile = __dirname + '/public/cul.zip';
	res.download(dlfile);
});

http.listen(80, function(){ //listen for requests at ipaddress:80
	console.log('Server is running on port 80');  //callback function, completely optional.
});
