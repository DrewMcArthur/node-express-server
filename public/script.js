$(document).ready(function(){
	//disable links that aren't working
	//$('.half:nth-child(1) a').addClass('disabled');
	$('.disabled').on('click', function(e){
		e.preventDefault();
		console.log("That link isn't quite ready yet.");
	});

	//blurred background when screen is wide enough
	var w = ($(document).width() - 889)/2;
	$('.side div').css('width', w + 'px');
	$(window).on('resize', function(){
		var w = ($(document).width() - 889)/2;
		$('.side div').css('width', w + 'px');
	});
});
