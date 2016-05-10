$(document).on('ready', function(){
	var socket = io();
	var name = getParameterByName('name');
	socket.emit('name', getParameterByName('name'));
	$('namebox').update(name);
	console.log(name);
	console.log(url);
	console.log('asdf;lkajs;gs');

	//gets variables in url
	function getParameterByName(name) {
		var url = window.location.href;
		console.log(url);
		name = name.replace(/[\[\]]/g, "\\$&");
		console.log(name);
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
		console.log(regex);
		results = regex.exec(url);
		console.log(results);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}
});
