var socket = io();
var name;
var isMobile;
var isTyping;

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) { 
	//tests if device is a hand held and creates boolean isMobile  (true if mobile, else false)
	isMobile = true; 
}else{
	isMobile = false;
} 

socket.on('ask name', function(){ //when the server asks for your name, 
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
	userTyping.nameID = userTyping.name.replace(/\W/g,"");  // this is to prevent bad id's on the elements by username
	if(userTyping.isTyping && !$('#'+userTyping.nameID).length && userTyping.name!=name){  
	// if a user is typing, and the typing element for that user does not yet exist, and the user that is typing is NOT the user of this client, then
		$('#messages').append("<li class=\"typingMessage\" id=\""+userTyping.nameID+"\">"+userTyping.nameID+" is Typing</li>"); //append a message that says they're typing.
	} else {
		if(!userTyping.isTyping && $('#'+userTyping.nameID).length){ //if the specific user is not typing, and the typing message exists
			$('#'+userTyping.nameID).remove(); // find the typing message for that user, and remove it. 
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
		var name = com.replace(/name\s*/,"");
		socket.emit('answer name', name); // and answer the server
	}else if(com.indexOf("online") > -1){
		socket.emit("ask who is online");
	}else{
		var message = {name:"Error",body:"Sorry, I don't have a help message for \"" + com +"\". Was it a typo? If you didn't mean to type a command, try again without the / in front."};
		addChatMessage(message);
	}
}
function commandHelp(com){
	//insert here what you'll do as a function of the command input by the client
}

$(document).ready(function(){
	var messageheight = $(document).height()-$('form').height();
	$('#messages').css('max-height',messageheight); //max height of the messages div should be the ( document height - the height of the input bar ), any larger would be scrolled
	$('#messages').css('bottom',$('form').height()+6); //sets bottom of the messages (position:fixed) to 6 more than the height of the input bar
});
