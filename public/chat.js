var socket = io();
var name;
$('form').submit(function(){
	socket.emit('chat message', $('#m').val());
	$('#m').val('');
	return false;
});
socket.on('chat message', function(msg){
	$('#messages').append($('<li>').text(msg));
	$('#messages').scrollTop($('#messages')[0].scrollHeight);
});
socket.on('ask name', function(){
	name = prompt("Please enter your name","Anonymous");
	socket.emit('answer name', name);
});	
var messageheight = $(document).height()-42;
$('#messages').css('height',messageheight);
