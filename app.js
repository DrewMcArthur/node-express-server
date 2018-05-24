var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var stream = require('stream');
var liner = new stream.Transform( { objectMode: true } );
var mysql = require('mysql');

app.use(express.static(__dirname + '/public'));//this hosts the files located in the ./public directory

function nameChange(UID, name){ // what to do when a user changes their name,
		var nameChangeTo = serverMessage("user"+UID+" logged on as \""+name+"\"."); //a person just entered the chat
		if(global.users[UID] != name){
			global.users[UID] = name; //all names of people online
			logger(nameChangeTo); // notify server that user is online
			makeUserList(); //iterate through users, and make an array without all of the holes
			logger(serverMessage(JSON.stringify(global.userList))); // log users online
			io.emit('chat message', nameChangeTo); //tell clients that the user changed their name
		}
	}

function makeUserList(){
	var j = 0;
	global.userList=[]; //userlist is empty
	for (i=0;i<global.uidCeil;i++){ //iterate through all of array users
		if(global.users[i] !== null){ //if the array is not null at index i, 
			global.userList[j] = global.users[i]; //set userList to that value at index j
			j++; // and increment j
		}
	}
}

function serverMessage(msgBody) { // take a string, and turn it into an object that appears to be made by the server
	msgFromServer = {
		name:"Server",
		timestamp:(new Date()).toLocalString(),
		body:msgBody
	};
	return msgFromServer;
}
function logger(message){ //log to the console and a hard file
	console.log(message);
	fs.appendFile(
		__dirname + "/messages.log", 
		message.timestamp + "	" + message.name + "	" + message.body + "\n", 
		function(err){ 
			if(err) { console.log(err); } 
		}
	);
}
function handleDisconnect(){
	db = mysql.createConnection(sqlconnarg); // connect to database
	db.connect(function(err) {              // The server is either down
		if(err) {                                     // or restarting (takes a while sometimes).
			logger(serverMessage('error when connecting to db:'+ err));
			setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
		}                                     // to avoid a hot loop, and to allow our node script to
	});                                     // process asynchronous requests in the meantime.
	// If you're also serving http, display a 503 error.
	db.on('error', function(err) {
		logger(serverMessage('db error', err));
		if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
			handleDisconnect();                         // lost due to either server restart, or a
		} else {                                      // connnection idle timeout (the wait_timeout
			throw err;                                  // server variable configures this)
		}
	});
}

Date.prototype.toLocalString = function() { // concat time strings to form one with format YYMMDDhhmmss
	function pad(number) { // used for time, to make sure the date isn't returned as 1491 instead of 140901
	  if ( number < 10 ) { 
	    return '0' + number;
	  }
	  return number;
	}

	return (
		"" + 
		pad( this.getYear() - 100 ) +
		pad( this.getMonth() + 1 ) +
		pad( this.getDate() ) +
		pad( this.getHours() ) +
		pad( this.getMinutes() ) +
		pad( this.getSeconds() )
	);
};

http.listen(80, function(){ //listen for requests at ipaddress:80
	logger(serverMessage('Server is running on port 80'));  //callback function, completely optional.
});

