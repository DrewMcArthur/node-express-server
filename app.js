var express = require('express');
var app = express();
var http = require('http').Server(app);
var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/drewdiezel.xyz-0001/privkey.pem', 'utf-8'),
  cert: fs.readFileSync('/etc/letsencrypt/live/drewdiezel.xyz-0001/fullchain.pem', 'utf-8')
};


//ensures all traffic is https
function requireHTTPS(req, res, next) {
    if (!req.secure) {
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

app.use(requireHTTPS);
app.use(express.static(__dirname + '/public'));

app.get('/download', function(req, res){
	console.log(req);
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
	console.log('HTTP Server listening on port 80.');
});

https.createServer(options, app).listen(443, function(){
	console.log('HTTPS Server listening on port 443.');
});
