var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = new Array(); // array of users online by UID
var numOfUsersOnline = 0; // incremented and decremented on connect and disconnect
var userList = new Array();  // array of users online in order (no holes in index)
var uidCeil = 100; // UID will be random number between 1 and uidCeil

app.use(express.static(__dirname + '/public')); // allow access to all files in ./public

io.on('connection', function(socket){ //on connection to a socket,

	var UID = Math.ceil(Math.random() * uidCeil); //set a UID to a random number

	while(users[UID] != null){ // try doing this, and if the UID is taken, keep repeating it
		UID = Math.ceil(Math.random() * uidCeil); // get new random number for UID
	}

	socket.emit('ask name'); //ask the server what the user's name is 

	socket.on('answer name', function(name){ // when the client responds, 
		var entered = name + " entered the chat!"; //a person just entered the chat
		users[UID] = name; //all names of people online
		console.log("user " + UID + " is online with name " + users[UID] + ";"); // notify server that user is online
		numOfUsersOnline++; // increase number online by 1
		var nOnline = numOfUsersOnline + " users are online."; // number of people online
		var uOnline = "Online: " + userList; // users online
		makeUserList(); //iterate through users, and make an array without all of the holes

		//says [user entered] to everyone, tells newb how many and who is online.
		socket.emit('chat message', nOnline); // tell client that just entered how many are online
		socket.emit('chat message', uOnline); // tell client that just entered who is online
		io.emit('chat message', entered);//this should be changed so that it only broadcasts to all of the other sockets, and not itself.
	}); // end what happens when the client answers with the user's name

	socket.on('typing check', function(name){
		io.emit('typing', name);
	});

	socket.on('chat message', function(msg){ //when the socket says the client sent a message,
		io.emit('chat message', msg); //tell all of the clients that there is a new message, and give it to them
	});

	socket.on('disconnect', function(){ //when the client disconnects from the server, 
		name = users[UID]; // sets var name to be the name found in the array users by the UID
		var left = name + " left the chat."; //tells everyone that user left
		io.emit('chat message', left); 
		numOfUsersOnline--; //still need to remove name from names array
		users[UID] = null; //removes userid from array of taken uids
		if(users[UID] !=null ){console.log("ERRRORRRRRR the uid of the user that just left is not null.  why'd that happen? D:");}	//error message just in case the line before didn't work.
		makeUserList(); //see :30
	});

});

function makeUserList(){
	var j = 0;
	userList=[]; //userlist is empty
	for (i=0;i<uidCeil;i++){ //iterate through all of array users
		if(users[i] != null){ //if the array is not null at index i, 
			userList[j] = users[i]; //set userList to that value at index j
			j++; // and increment j
		}else{ // I don't think I need the else
		}
	}
}

http.listen(1337, function(){ //listen for requests at ipaddress:1337
	console.log("Server is running on port 1337");		//callback function, completely optional.
});




