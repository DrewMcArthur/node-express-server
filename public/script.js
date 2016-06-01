$(document).ready(function(){
	//blurred background when screen is wide enough
	var w = ($(document).width() - 889)/2;
	$('.side div').css('width', w + 'px');
	$(window).on('resize', function(){
		var w = ($(document).width() - 889)/2;
		$('.side div').css('width', w + 'px');
	});
});
