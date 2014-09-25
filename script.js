$(document).ready(function(){
	$('button.friend.btn').on('click',function(){
		console.log('clicked');
		var nameGET = $('input.friend.name').val();
		console.log(nameGET);
	});
});
