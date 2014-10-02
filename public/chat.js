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

$('form').submit(function(){ //when user presses 'send'
	if($('#m').val()){ //prevents sending of blank messages
		socket.emit('chat message', $('#m').val()); 
		//send an event 'chat message' to the server
		$('#m').val(''); //clear form
	}
	return false;
}); //end form submit function

socket.on('chat message', function(msg){ //when the server sends a chat message, 
	$('#messages').append($('<li>').text(msg.name + ":	" + msg.body)); //append a message as an li
	$('#messages').scrollTop($('#messages')[0].scrollHeight); //and scroll to the bottom of the page
});

socket.on('ask name', function(){ //when the server asks for your name, 
	name = prompt("Please enter your name",""); // prompt for the name
	socket.emit('answer name', name); // and answer the server
	$('form').focus();
});	

/*
socket.on('userTyping',function(userName){ // when the server says someone is typing, then
	userTyping(userName); // userName is the name of the person typing, sent from the server.  not the name of the current user.
});
*/

function mobileInputLocation(){
/*
	if(isMobile){
		if($('input').val()){
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
*/
}
/*
function userTyping(userTyping){
	
	if(userTyping.isTyping){
		var firstLetter = userTyping.name.charAt(0);
	}else{
	}
}
function typing(name){
	if($('input').val()){
		isTyping = true;
	} else {
		isTyping = false;
	}
	var nameTyping = { name:name,isTyping:isTyping };
	socket.emit('typing',nameTyping);
};
function engine(){
	setInterval(function(){
		typing(name);
	},500);
};
*/

$(document).ready(function(){
	var messageheight = $(document).height()-$('form').height();
	$('#messages').css('max-height',messageheight); //max height of the messages div should be the ( document height - the height of the input bar ), any larger would be scrolled
	$('#messages').css('bottom',$('form').height()+6); //sets bottom of the messages (position:fixed) to 6 more than the height of the input bar
	//engine();
});
