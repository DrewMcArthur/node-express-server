$(document).ready(function(){
	$('button.friend.btn').on('click',function(){
		var nameGET = $('input.friend.name').val();
		console.log(nameGET);
	});
});
