var socket = io();
var name;
var isMobile;

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	isMobile = true; 
}else{
	isMobile = false;
} $('form').submit(function(){ socket.emit('chat message', name + ": " + $('#m').val()); $('#m').val('');
	return false;
});
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
$(document).ready(function(){
	var messageheight = $(document).height()-42;
	$('#messages').css('max-height',messageheight);
});
function mobileInputLocation(){
	if(isMobile){
		if($('input').val()){
			/*
			$('#messages').css('max-height', ($(document).height()-42)/2);
			$('body').scrollBottom($('body')[0].scrollHeight);
			*/
			$('form').css('bottom','50%');
		}else{
			$('form').css('bottom','0');
		}
	}
}
function typing(name){
	if($('input').val()){
		/*
		console.log(name+' is typing');
		socket.emit('typing check', name);
		*/
	}
};
function engine(){
	setInterval(function(){
		typing(name);
	},10);
};
$(document).ready(function(){
	engine();
});
