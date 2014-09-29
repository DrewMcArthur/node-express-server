var socket = io();
var name;
var isMobile;

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	isMobile = true; 
}else{
	isMobile = false;
}

$('form').submit(function(){
	socket.emit('chat message', name + ": " + $('#m').val());
	$('#m').val('');
	return false;
});
/*
//if(isMobile){
	$('form').on("focus", function(){
		socket.emit('chat message', "form has been focused!");
	});
//}
*/
socket.on('chat message', function(msg){
	$('#messages').append($('<li>').text(msg));
	$('#messages').scrollTop($('#messages')[0].scrollHeight);
});
socket.on('ask name', function(){
	name = prompt("Please enter your name","");
	socket.emit('answer name', name);
});	
socket.on('typing',function(name){
	//socket.emit('chat message', name + " is typing!");//old syntax
});
var messageheight = $(document).height()-42;
$('#messages').css('height',messageheight);
function typing(name){
	if($('input').val()){
		console.log(name+' is typing');
		socket.emit('typing check', name);
	}
};
function engine(){
	setInterval(function(){
		typing(name);
	},1000);
};
$(document).ready(function(){
	engine();
});
