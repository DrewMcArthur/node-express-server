var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var stream = require('stream');
var liner = new stream.Transform( { objectMode: true } );
//var mysql = require('mysql');

var global = {
	users: [], // array of users online by UID
	numOfUsersOnline: 0, // incremented and decremented on connect and disconnect
	userList: [],  // array of users online in order (no holes in index)
	uidCeil: 10000 // UID will be random number between 1 and uidCeil
};

app.use(express.static(__dirname + '/public')); // allow access to all files in ./public

io.on('connection', function(socket){ //on connection to a socket,

	//console.log(socket); //logs all connection information wow
	
	var address = socket.handshake.address; //ip address of client
	logger(serverMessage(address));

	io.on('name', function(name) {
		var random = Math.ceil(Math.random() * global.uidCeil); //set a UID to a random number

		while(global.users[random] !== null){ // try doing this, and if the UID is taken, keep repeating it
			if(global.users[random] !== null){ // if UID is taken
				random = Math.ceil(Math.random() * global.uidCeil); // get new random number for UID
			}
		}
		
		var UID = random; //uid is set to that random number
		socket.emit('name is', name); //tell the client what their name and uid are
		socket.emit('UID is', UID);

		global.users[UID] = name; //all names of people online
		logger(serverMessage('user ' + UID + ' with name ' + global.users[UID] + ' is online;')); // log on server that user is online

		global.numOfUsersOnline++; // increase number online by 1

		makeUserList(); //iterate through users, and make an array without all of the holes
	});
	

	socket.on('disconnect', function(){ //when the client disconnects from the server, 
		name = global.users[UID]; // sets var name to be the name found in the array users by the UID
		var left = name + " left the chat."; //tells everyone that user left
		var userTyping = {name:name,isTyping:false}; //if the user leaves, make sure no one thinks they're typing. 
		io.emit('typing message',userTyping); //update clients with this new information
		io.emit('chat message', serverMessage(left)); //update the clients that the user left the website
		global.numOfUsersOnline--;  // number of people online goes down by one
		global.users[UID] = null; //removes userid from array of taken uids
		makeUserList(); //see :30
		logger(serverMessage('user ' + UID + ' with name ' + global.users[UID] + ' is offline;')); // notify server that user is offline
		logger(serverMessage(JSON.stringify(global.userList))); // log users online
	});
});

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
