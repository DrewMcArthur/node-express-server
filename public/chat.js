var socket = io();
var name;
$('form').submit(function(){
	socket.emit('chat message', name + ": " + $('#m').val());
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
socket.on('typing',function(name){
	socket.emit('chat message', name + " is typing!");
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
