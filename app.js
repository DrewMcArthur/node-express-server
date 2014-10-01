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
/*  attempt at error if while loop goes too long.  just have to hope that doesn't happen, i guess.
 
		if(10000<ifThisGetsTooBigThenQuit){
			fs.writeFile("/error.log", "The while loop ran for too long, sorry. Here's the random number we stopped on: "+ random, function(err) {
				if(err) {
					console.log(err);
				} else {
					console.log("The file was saved!");
				}
			}); 
			process.exit("error");
		}; // if the while loop goes for too long, then stop the server, and save an error.log
*/
	}
	
	var UID = random;

	socket.emit('ask name'); //ask the server what the user's name is 

	socket.on('answer name', function(name){ // when the client responds, 

		var entered = name + " entered the chat!"; //a person just entered the chat
		users[UID] = name; //all names of people online
		console.log("user " + UID + " with name " + users[UID] + " is online;"); // notify server that user is online

		var nOnline = numOfUsersOnline + " other users are online."; // number of people online if 3+
		var n1Online = numOfUsersOnline + " other user is online."; // number of people online if only 2
		var uOnline = "Online: " + userList; // users online

		numOfUsersOnline++; // increase number online by 1

		makeUserList(); //iterate through users, and make an array without all of the holes
		console.log(userList); // log users online

		//says [user entered] to everyone, tells newb how many and who is online.
		if(numOfUsersOnline>1){ //if there's someone else online, then
			if(numOfUsersOnline==2){
				socket.emit('chat message',serverMessage(n1Online)); //number of people online if only 1 other person
			} else {
				socket.emit('chat message', serverMessage(nOnline)); // tell client that just entered how many are online
			}
			socket.emit('chat message', serverMessage(uOnline)); // tell client that just entered who is online
			console.log(serverMessage(uOnline));
			io.emit('chat message', serverMessage(entered));//this should be changed so that it only broadcasts to all of the other sockets, and not itself.
		} else { // otherwise, if you're the only one on the server
			socket.emit('chat message', serverMessage("You are the only user currently online."));
		}

	}); // end what happens when the client answers with the user's name

	socket.on('typing check', function(name){
		io.emit('typing', name);
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
		console.log(msg);
		fs.appendFile(__dirname + "/public/messages.log", msg.timestamp + "	"+ msg.name + "	" + msg.body + "\n", function(err) { // add message, name and timestamp to log file
			if(err) { console.log(err); }
		}); 
	});

	socket.on('disconnect', function(){ //when the client disconnects from the server, 
		name = users[UID]; // sets var name to be the name found in the array users by the UID
		var left = name + " left the chat."; //tells everyone that user left
		io.emit('chat message', serverMessage(left));
		numOfUsersOnline--; //still need to remove name from names array
		users[UID] = null; //removes userid from array of taken uids
		makeUserList(); //see :30
		console.log("user " + UID + " with name " + users[UID] + " is offline;"); // notify server that user is offline
		console.log(userList); // log users online
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
	msg = {
		body:msgBody,
		name:"Server",
		timestamp:(new Date()).toLocalString()
	}
	return msg;
}

function pad(number) { // used for time, to make sure the date isn't returned as 1491 instead of 140901
  if ( number < 10 ) { 
    return '0' + number;
  }
  return number;
}

Date.prototype.toLocalString = function() { // concat time strings to form one with format YYMMDDhhmmss
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
	console.log("Server is running on port 1337");		//callback function, completely optional.
});
