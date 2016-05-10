$(document).ready(function(){
	$('a.gameEnter').on('click', function(e) {
		e.preventDefault();
		var name = $('.username').val();
		if(name != '')
			location.href = '/game.html?name='+name;
		else
			alert('You needa put in a name');
	});
});
