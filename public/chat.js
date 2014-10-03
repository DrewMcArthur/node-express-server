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
	name = prompt("Please enter your name",""); // prompt for the name
	socket.emit('answer name', name); // and answer the server
	$('form').focus();
});	

socket.on('ask if typing', function(){
	if($('input').val()){
		isTyping = true;
	} else {
		isTyping = false;
	}
	var userTyping = { name:name,isTyping:isTyping };
	socket.emit('typing checked', userTyping);
});

socket.on('typing message', function(userTyping){
	userTyping.nameID = userTyping.name.replace(/\W/g,"");
	if(userTyping.isTyping && !$('#'+userTyping.nameID).length && userTyping.name!=name){
		$('#messages').append("<li class=\"typingMessage\" id=\""+userTyping.nameID+"\">"+userTyping.nameID+" is Typing</li>");
	} else {
		if(!userTyping.isTyping){
			$('#'+userTyping.nameID).remove();
		}
	}
});

$('form').submit(function(){ //when user presses 'send'
	if($('#m').val()){ //prevents sending of blank messages
		socket.emit('chat message', $('#m').val()); 
		//send an event 'chat message' to the server
		$('#m').val(''); //clear form
		isTyping = false;
		var userTyping = { name:name,isTyping:isTyping };
		socket.emit('typing checked', userTyping);
	}
	return false;
}); //end form submit function

socket.on('chat message', function(msg){ //when the server sends a chat message, 
/*
	if($('#messages li.typingMessage').length){
		var liToInsert = "<li>" + msg.name + ":	" + msg.body + "</li>";
		$(liToInsert).insertBefore($'#messages li.typingMessage');
//		$('#messages li.typingMessage').prepend($('<li>').text(msg.name + ":	" + msg.body)); //append a message as an li
	}else{
		$('#messages').append($('<li>').text(msg.name + ":	" + msg.body)); //append a message as an li
	}
*/
	$('#messages').append('<li class=\"message\">' + msg.name + ":	" + msg.body + "</li>"); //append a message as an li
	$('#messages').scrollTop($('#messages')[0].scrollHeight); //and scroll to the bottom of the page
	if($('#messages li.typingMessage').length){ 
		$('#messages li.message:last-child').insertBefore($('#messages li.typingMessage'));
	}
});

/*
function mobileInputLocation(){
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
}
*/

$(document).ready(function(){
	var messageheight = $(document).height()-$('form').height();
	$('#messages').css('max-height',messageheight); //max height of the messages div should be the ( document height - the height of the input bar ), any larger would be scrolled
	$('#messages').css('bottom',$('form').height()+6); //sets bottom of the messages (position:fixed) to 6 more than the height of the input bar
});
