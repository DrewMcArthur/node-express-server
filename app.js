var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var stream = require('stream');
var liner = new stream.Transform( { objectMode: true } )
var mysql = require('mysql');

var global = {
	users: [], // array of users online by UID
	numOfUsersOnline: 0, // incremented and decremented on connect and disconnect
	userList: [],  // array of users online in order (no holes in index)
	uidCeil: 10000, // UID will be random number between 1 and uidCeil
//	sociallyLoggedIn: false; // boolean if user has logged in with ( fb || google )  //this can't be a global variable silly
}
var sqlconnarg = { //arguments for the sql connection
	host : "localhost",
	user : "root",
	password : "password"
}
//var db = mysql.createConnection(sqlconnarg); // connect to database

app.use(express.static(__dirname + '/public')); // allow access to all files in ./public

io.on('connection', function(socket){ //on connection to a socket,

	//console.log(socket); //logs all connection information wow
	
	var address = socket.handshake.address;
	logger(serverMessage(address));
	
	var random = Math.ceil(Math.random() * global.uidCeil); //set a UID to a random number

	while(global.users[random] != null){ // try doing this, and if the UID is taken, keep repeating it
		if(global.users[random] != null){ // if UID is taken
			random = Math.ceil(Math.random() * global.uidCeil); // get new random number for UID
		}
	}
	
	var UID = random;
	var name = "user"+UID;
	socket.emit('name is', name);
	socket.emit('UID is', UID);

	var entered = name + " entered the chat!"; //a person just entered the chat
	global.users[UID] = name; //all names of people online
	logger(serverMessage('user ' + UID + ' with name ' + global.users[UID] + ' is online;')); // notify server that user is online

	var nOnline = global.numOfUsersOnline + " other users are online."; // number of people online if 3+
	var n1Online = global.numOfUsersOnline + " other user is online."; // number of people online if only 2
	var uOnline = "Online: " + global.userList; // users online

	global.numOfUsersOnline++; // increase number online by 1

	makeUserList(); //iterate through users, and make an array without all of the holes
	logger(serverMessage(JSON.stringify(global.userList))); // log users online

	//says [user entered] to everyone, tells newb how many and who is online.
	if(global.numOfUsersOnline>1){ //if there's someone else online, then
		if(global.numOfUsersOnline==2){
			socket.emit('chat message',serverMessage(n1Online)); //number of people online if only 1 other person
		} else {
			socket.emit('chat message', serverMessage(nOnline)); // tell client that just entered how many are online
		}
		socket.emit('chat message', serverMessage(uOnline)); // tell client that just entered who is online
		io.emit('chat message', serverMessage(entered));//this should be changed so that it only broadcasts to all of the other sockets, and not itself.
	} else { // otherwise, if you're the only one on the server
		socket.emit('chat message', serverMessage("You are the only user currently online."));
	}
	socket.emit('chat message',serverMessage("Your name is currently just your UID.  You can change this by typing \"/name [your new name]\", for Example: \"/name john\""));

	socket.on('social login', function(data){
		logger(serverMessage(JSON.stringify(data)));

		var nid; if (data.network == "facebook") { nid = data.global.fbID; } else if (data.network=="google"){ nid = data.global.gID; }

		var db = mysql.createConnection(sqlconnarg); // connect to database
		db.connect(); db.query("use chatapp");
		
		//find nid in table users in column nid;
		//if nid exists, then get the column name in that row, and set that value equal to the user's name. 
		var insertStatement = "INSERT INTO usernames (name, uid)"; //mysql statement saying to add something into a table 'usernames'
		var values = "VALUES (" + db.escape(data.global.name) + "," + db.escape(nid) + ");"; //mysql statement of what to add, used with statement above
		var checkIfExists = "SELECT name FROM usernames WHERE uid = " + db.escape(nid); //statement to check if the uid exists in the table already
		db.query(checkIfExists,function(err, res){ // make sql query to db to check if the uid exists already
			if(err){throw(err);} //error checking
			if(JSON.stringify(res)!='[]') {  //if the response is not empty, i.e, there is a row for that uid, then
				var socialName = JSON.parse(JSON.stringify(res).replace(/\[/g,"").replace(/\]/g,"")).name;  // get name from response
				nameChange(UID,socialName); //tell client their name is socialName, and update userList etc.
				socket.emit('name is', socialName);
			}else{ //if it doesn't exist, create the entry and prompt for the user's name
				if(nid != null){ // to make sure the user has a socialid, 
					if(data.global.nameChanged){ //if they have changed their name from the standard userXXXX,
						db.query(insertStatement + values,function(err, res){ //add the user with that uid and name into the table usernames
							if(err){throw(err);} //error checking
							db.query('select * from usernames',function(err, res){ // now log the table after this addition
								if(err){throw(err);}
								logger(res);
							});
						});
					} else {
						//if the user hasn't changed their name yet, now we just have to wait until they change their name
					}
				}
			}
		});
		db.end(function(err){if(err){throw(err);}}); //ends database connection;
	});

	socket.on('answer name', function(arg){
		nameChange(UID,arg.name);
		if (arg.sociallyLoggedIn) {
			var db = mysql.createConnection(sqlconnarg); // connect to database
			db.connect(); db.query("use chatapp");

			var nid; if (arg.fbid != "") { nid = arg.fbid; } else if (arg.gid != ""){ nid = arg.gid; }
			var insertStatement = "INSERT INTO usernames (name, uid)"; //mysql statement saying to add something into a table 'usernames'
			var values = "VALUES (" + db.escape(arg.name) + "," + db.escape(nid) + ");"; //mysql statement of what to add, used with statement above
			var checkIfExists = "SELECT name FROM usernames WHERE uid = " + db.escape(nid); //statement to check if the uid exists in the table already
			db.query(checkIfExists, function(err, res){
				if(err){throw(err)} // error checking 
				if(JSON.stringify(res)=='[]'){
					db.query(insertStatement + values, function(err, res){
						if(err){throw(err);} // error checking;
						db.query("SELECT * FROM usernames",function(err,res){ if(err){throw(err)};logger(res);}); //log db;
					});
				}
			});

			db.end(function(err){if(err){throw(err);}}); //ends database connection;
		}
	}); // end what happens when the client answers with the user's name
	
/*
	socket.on('set ip name', function(nameSet){
		fs.appendFile(
			__dirname + "/ip.db", 
			address+":"+nameSet+",\n",
			function(err){ 
				if(err) { console.log(err); } 
			}
		);
		fs.readFile(__dirname + '/ip.db', function (err, data) { 
			if(err) throw err;
			console.log("file is "+data.toString('utf8'));
		});
	});
*/
	
	setInterval(function(){
		io.emit('ask if typing'); // every X milliseconds, send out a request to the clients asking if the user is typing
	},500); //the number here is Xms
	
	socket.on('typing checked', function(userTyping){ // when the client responds, 
		if(!(userTyping.name.indexOf("user") > -1)){
			io.emit('typing message',userTyping); //tell everyone the results of the previous request
		}
	});

	socket.on('chat message', function(body){ //when the socket says the client sent a message,
		var name = global.users[UID]; //get name by UID
		var timestamp = (new Date()).toLocalString(); // call new time string format
		var msg = { // messages are now sent as an object, with this format.  MSGOJB
			name:name,
			ip:address,
			timestamp:timestamp,
			body:body
		};
		io.emit('chat message', msg); //tell all of the clients that there is a new message, and give it to them
		logger(msg);
	});
	
	socket.on('ask who is online', function(){
		var nOnline = global.numOfUsersOnline + " users are online."; // number of people online
		var uOnline = {name:"Online",timestamp:new Date().toLocalString(), body:global.userList}; // users online
		if(global.numOfUsersOnline>1){ //if there's someone else online, then
			socket.emit('chat message', serverMessage(nOnline)); // tell client that just entered how many are online
			socket.emit('chat message', uOnline); // tell client that just entered who is online
		} else { // otherwise, if you're the only one on the server
			socket.emit('chat message', serverMessage("You are the only user currently online."));
		}
	});

	socket.on('pm', function(pmData){
		var toUID = global.users.indexOf(pmData.to);
		pmData["toUID"] = toUID;
		pmData["fromUID"] = UID;
		logger(pmData);
		io.emit('pm sent',pmData);
	});

	socket.on('disconnect', function(){ //when the client disconnects from the server, 
		name = global.users[UID]; // sets var name to be the name found in the array users by the UID
		var left = name + " left the chat."; //tells everyone that user left
		var userTyping = {name:name,isTyping:false};
		io.emit('typing message',userTyping);
		io.emit('chat message', serverMessage(left));
		global.numOfUsersOnline--;  // number of people online goes down by one
		global.users[UID] = null; //removes userid from array of taken uids
		makeUserList(); //see :30
		logger(serverMessage('user ' + UID + ' with name ' + global.users[UID] + ' is offline;')); // notify server that user is offline
		logger(serverMessage(JSON.stringify(global.userList))); // log users online
	});

});

function nameChange(UID, name){ // what to do when a user changes their name,
		var nameChange = serverMessage("user"+UID+" logged on as \""+name+"\"."); //a person just entered the chat
		global.users[UID] = name; //all names of people online
		logger(nameChange); // notify server that user is online
		makeUserList(); //iterate through users, and make an array without all of the holes
		logger(serverMessage(JSON.stringify(global.userList))); // log users online
		io.emit('chat message', nameChange);
	}

function makeUserList(){
	var j = 0;
	global.userList=[]; //userlist is empty
	for (i=0;i<global.uidCeil;i++){ //iterate through all of array users
		if(global.users[i] != null){ //if the array is not null at index i, 
			global.userList[j] = global.users[i]; //set userList to that value at index j
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

http.listen(80, function(){ //listen for requests at ipaddress:80
	logger(serverMessage('Server is running on port 80'));  //callback function, completely optional.
});

