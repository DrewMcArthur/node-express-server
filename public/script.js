$(document).ready(function(){
	var w = ($(document).width() - 889)/2;
	$('.side div').css('width', w + 'px');
	$('.spotify').on('click', function(e){
		e.preventDefault();
		console.log("i don't have a spotify page yet");
	});
});
$(document).on('resize', function(){
	var w = ($(document).width() - 889)/2;
	$('.side div').css('width', w + 'px');
});

