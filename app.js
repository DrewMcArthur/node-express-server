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

http.listen(80, function(){ //listen for requests at ipaddress:80
	console.log('HTTP Server listening on port 80.');
});

https.createServer(options, app).listen(443, function(){
	console.log('HTTPS Server listening on port 443.');
});
