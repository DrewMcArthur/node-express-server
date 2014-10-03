var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var users = new Array(); // array of users online by UID
var numOfUsersOnline = 0; // incremented and decremented on connect and disconnect
var userList = new Array();  // array of users online in order (no holes in index)
var uidCeil = 10000; // UID will be random number between 1 and uidCeil

app.use(express.static(__dirname + '/public')); // allow access to all files in ./public

io.on('connection', function(socket){ //on connection to a socket,
	
	var random = Math.ceil(Math.random() * uidCeil); //set a UID to a random number

	while(users[random] != null){ // try doing this, and if the UID is taken, keep repeating it
		if(users[random] != null){ // if UID is taken
			random = Math.ceil(Math.random() * uidCeil); // get new random number for UID
		}
	}
	
	var UID = random;
	name = "user"+UID;

	var entered = name + " entered the chat!"; //a person just entered the chat
	users[UID] = name; //all names of people online
	logger(serverMessage('user ' + UID + ' with name ' + users[UID] + ' is online;')); // notify server that user is online

	var nOnline = numOfUsersOnline + " other users are online."; // number of people online if 3+
	var n1Online = numOfUsersOnline + " other user is online."; // number of people online if only 2
	var uOnline = "Online: " + userList; // users online

	numOfUsersOnline++; // increase number online by 1

	makeUserList(); //iterate through users, and make an array without all of the holes
	logger(serverMessage(JSON.stringify(userList))); // log users online

	//says [user entered] to everyone, tells newb how many and who is online.
	if(numOfUsersOnline>1){ //if there's someone else online, then
		if(numOfUsersOnline==2){
			socket.emit('chat message',serverMessage(n1Online)); //number of people online if only 1 other person
		} else {
			socket.emit('chat message', serverMessage(nOnline)); // tell client that just entered how many are online
		}
		socket.emit('chat message', serverMessage(uOnline)); // tell client that just entered who is online
		io.emit('chat message', serverMessage(entered));//this should be changed so that it only broadcasts to all of the other sockets, and not itself.
	} else { // otherwise, if you're the only one on the server
		socket.emit('chat message', serverMessage("You are the only user currently online."));
	}
	socket.emit('chat message',serverMessage("Your name is currently just your UID.  You can change this by typing \"/name [your new name]\", for Example: \"/name John\""));


	socket.on('answer name', function(name){ // when the client responds, 

		var nameChange = "user"+UID+" changed their name to \""+name+"\"."; //a person just entered the chat
		users[UID] = name; //all names of people online
		logger(serverMessage(nameChange)); // notify server that user is online

		makeUserList(); //iterate through users, and make an array without all of the holes
		logger(serverMessage(JSON.stringify(userList))); // log users online

		io.emit('chat message', serverMessage(nameChange));

	}); // end what happens when the client answers with the user's name
	
	setInterval(function(){
		io.emit('ask if typing'); // every X milliseconds, send out a request to the clients asking if the user is typing
	},500); //the number here is Xms
	
	socket.on('typing checked', function(userTyping){ // when the client responds, 
		io.emit('typing message',userTyping); //tell everyone the results of the previous request
	});

	socket.on('chat message', function(body){ //when the socket says the client sent a message,
		var name = users[UID]; //get name by UID
		var timestamp = (new Date()).toLocalString(); // call new time string format
		var msg = { // messages are now sent as an object, with this format.  MSGOJB
			name:name,
			timestamp:timestamp,
			body:body
		};
		io.emit('chat message', msg); //tell all of the clients that there is a new message, and give it to them
		logger(msg);
	});
	
	socket.on('ask who is online', function(){
		var nOnline = numOfUsersOnline + " other users are online."; // number of people online if 3+
		var n1Online = numOfUsersOnline + " other user is online."; // number of people online if only 2
		var uOnline = {name:"Online",timestamp:new Date().toLocalString(), body:userList}; // users online
		if(numOfUsersOnline>1){ //if there's someone else online, then
			if(numOfUsersOnline==2){
				socket.emit('chat message',serverMessage(n1Online)); //number of people online if only 1 other person
			} else {
				socket.emit('chat message', serverMessage(nOnline)); // tell client that just entered how many are online
			}
			socket.emit('chat message', uOnline); // tell client that just entered who is online
		} else { // otherwise, if you're the only one on the server
			socket.emit('chat message', serverMessage("You are the only user currently online."));
		}
	});

	socket.on('disconnect', function(){ //when the client disconnects from the server, 
		name = users[UID]; // sets var name to be the name found in the array users by the UID
		var left = name + " left the chat."; //tells everyone that user left
		var userTyping = {name:name,isTyping:false};
		io.emit('typing message',userTyping);
		io.emit('chat message', serverMessage(left));
		numOfUsersOnline--;  // number of people online goes down by one
		users[UID] = null; //removes userid from array of taken uids
		makeUserList(); //see :30
		logger(serverMessage('user ' + UID + ' with name ' + users[UID] + ' is offline;')); // notify server that user is offline
		logger(serverMessage(JSON.stringify(userList))); // log users online
	});

});

function makeUserList(){
	var j = 0;
	userList=[]; //userlist is empty
	for (i=0;i<uidCeil;i++){ //iterate through all of array users
		if(users[i] != null){ //if the array is not null at index i, 
			userList[j] = users[i]; //set userList to that value at index j
			j++; // and increment j
		}
	}
}

function serverMessage(msgBody) { 
	msgFromServer = {
		name:"Server",
		timestamp:(new Date()).toLocalString(),
		body:msgBody
	}
	return msgFromServer;
}
function logger(message){
	console.log(message);
	fs.appendFile(
		__dirname + "/public/messages.log", 
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

http.listen(1337, function(){ //listen for requests at ipaddress:1337
	logger(serverMessage('Server is running on port 1337'));  //callback function, completely optional.
});
