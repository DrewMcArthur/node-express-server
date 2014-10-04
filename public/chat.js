var socket = io();
var name;
var isMobile;
var isTyping;
var nameChanged;

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) { 
	//tests if device is a hand held and creates boolean isMobile  (true if mobile, else false)
	isMobile = true; 
}else{
	isMobile = false;
} 
socket.on('name is', function(nameReceived){
	name = nameReceived;
});

socket.on('ask if typing', function(){ //when the server asks if the user is typing
	if($('#m').val()){  //the client checks the value of the input, and if there's anything there, i.e user is typing
		isTyping = true;  // client sets a variable accordingly
	} else {
		isTyping = false;
	}
	var userTyping = { name:name,isTyping:isTyping }; //make a variable as an object of the username and boolean whether or not they're typing
	socket.emit('typing checked', userTyping); // reply to the server that the user is or is not typing with that object.
});

socket.on('typing message', function(userTyping){ // whenever a client responds to the server, then the server sends a reply to all clients.  
	userTyping.nameID = userTyping.name.replace(/\s/g,"");  // this is to prevent bad id's on the elements by username
	if(userTyping.isTyping && !$('#'+userTyping.nameID).length && userTyping.name!=name){  
	// if a user is typing, and the typing element for that user does not yet exist, and the user that is typing is NOT the user of this client, then
		if(!$('#messages ul.typingMessage').length){
			$('#messages').append("<ul class=\"typingMessage\" id=\""+userTyping.nameID+"P\"></ul>"); //append a message that says they're typing.
		}
			$('#messages li.typingMessage').append("<li id=\""+userTyping.nameID+"\">"+userTyping.nameID+" is Typing</li>"); //append a message that says they're typing.
	} else {
		if(!userTyping.isTyping && ($('#'+userTyping.nameID).length || $('#'+userTyping.nameID+'P').length )){ //if the specific user is not typing, and the typing message exists
			$('#'+userTyping.nameID).remove(); // find the typing message for that user, and remove it. 
			$('#'+userTyping.nameID+'P').remove(); // find the typing message for that user, and remove it. 
		}
	}
});

$('form').submit(function(){ //when user presses 'send'
	if($('#m').val()){ //prevents sending of blank messages
		var firstLetter = $('#m').val().charAt(0);
		if(firstLetter=="/"){
			clientCommand($('#m').val());
			$('#m').val(''); //clear form
			isTyping = false;
			var userTyping = { name:name,isTyping:isTyping };
			socket.emit('typing checked', userTyping);
		}else{
			socket.emit('chat message', $('#m').val()); 
			//send an event 'chat message' to the server
			$('#m').val(''); //clear form
			isTyping = false;
			var userTyping = { name:name,isTyping:isTyping };
			socket.emit('typing checked', userTyping);
		}
	}
	return false;
}); //end form submit function

socket.on('chat message', function(msg){addChatMessage(msg)}); //when the server sends a chat message, add that chat message

function addChatMessage(msg){
	$('#messages').append('<li class=\"message\">' + msg.name + ":	" + msg.body + "</li>"); //append a message as an li
	$('#messages').scrollTop($('#messages')[0].scrollHeight); //and scroll to the bottom of the page
	if($('#messages li.typingMessage').length){ 
		$('#messages li.message:last-child').insertBefore($('#messages li.typingMessage'));
	}
}

/*
function mobileInputLocation(){
	if(isMobile){
		if($('#m').val()){
			/*
			$('#messages').css('max-height', ($(document).height()-42)/2);
			$('body').scrollBottom($('body')[0].scrollHeight);
			*/
/*
			$('#messages').css('margin-top','50%');
//			$('form').css('bottom','50%');
		}else{
//			$('form').css('bottom','0');
		}
	}
}
*/
function clientCommand(com){
	com = com.replace(/\//,"").toLowerCase();
	if( com.indexOf("help") > -1 || com.indexOf("?") > -1 ) {
		commandHelp(com);
	}else if(com.indexOf("name") > -1){
		//if(com.indexOf("set") > -1){
		//	nameSet = com.replace(/name\s*set\s*/,"");
	//		socket.emit('set ip name', nameSet);
	/*	} else*/ if(com.replace(/\s+/g,"")=="name"){	
			addChatMessage(serverMessage("Your name is "+name));
		} else if(!nameChanged){
			nameID = name.replace(/\s/g,"");  // this is to prevent bad id's on the elements by username
			$('#'+nameID).remove(); // find the typing message for that user, and remove it, since that user no longer exists. // should probably add .typingMessage on to selector.
			name = com.replace(/name\s*/,"");
			if(name!=""){
				socket.emit('answer name', name); // and answer the server
				nameChanged = true;
			}
		} else {
			var message = {name:"Error",body:"You've already changed your name and we only allow you to do that once, sorry."};
			addChatMessage(message);
		}
	}else if(com.indexOf("online") > -1){
		socket.emit("ask who is online");
	}else{
		var message = {name:"Error",body:"Sorry, I don't have a help message for \"" + com +"\". Was it a typo? If you didn't mean to type a command, try again without the / in front."};
		addChatMessage(message);
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

function commandHelp(com){
	//insert here what you'll do as a function of the command input by the client
	addChatMessage(serverMessage("/Online returns the names of users currently online.\n/name changes your name.  This can only be done once per connection.\n"));
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

$(document).ready(function(){
	var messageheight = $(document).height()-$('form').height();
	$('#messages').css('max-height',messageheight); //max height of the messages div should be the ( document height - the height of the input bar ), any larger would be scrolled
	$('#messages').css('bottom',$('form').height()+6); //sets bottom of the messages (position:fixed) to 6 more than the height of the input bar
});
