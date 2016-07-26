var causewayStatus = false;
var socket = io();

socket.on('update', function(data){
	setCausewayStatus(data);
});

var setCausewayStatus = function(stat){
	if(typeof stat !== 'undefined') causewayStatus = stat;
	if(causewayStatus)
		$('#status').text("Open");
	else
		$('#status').text("Closed");
}
var toggleCausewayStatus = function(){
	setCausewayStatus(!causewayStatus);
}
var centerDiv = function(selector){
	//given a selector, this centers the div within its parent using left
	//var pw = $(selector).parent().width();
	var pw = $(window).outerWidth(true);
	var w = $(selector).outerWidth(true);
	var l = (pw - w) / 2;
	//$(selector).css('margin','0');
	$(selector).css('left', l + 'px');
}
var handleMoreInfoLocation = function(){
	var linksHeight = $('.links').position().top;
	var height = $(window).height();
	//if the links are more than halfway down the page, then the fun begins
	if (linksHeight > (height * 3 / 5)){
		$('#status').addClass('moreInfoOverlay');
		$('.links').addClass('moreInfoOverlay');
		$('.more-info').addClass('moreInfoOverlay');
	}
}

$(document).ready(function(){
	//image sizing handling
	var maxHeight = $(window).height() - 40; //don't wanna have to scroll
	var imgWidth = $('div.status-display').width(); //from the screen width
	var imgHeight = imgWidth / 313 * 235; //get the height with a ratio
	if(imgHeight > maxHeight){ //if this is bigger than the screen
		$('div.status-display').css('margin','20px auto') //reset margin
				       .height(maxHeight + 'px') //set maxHeight
				       .width((maxHeight / 235 * 313) + 'px');
					//and then calculate width
		$('.links').addClass('inPic');
		//$('.more-info').css('width', ((maxHeight / 235 * 313) - 20 + 'px'));
		//centerDiv('.more-info');
	} else { //otherwise, just set the height
		$('div.status-display').height(imgHeight + 'px');
	}
	
	centerDiv('.links');

	//bottom button handling
	$('.links div').on('click',function(){
		//link of the button we clicked
		var clickeduri = $(this).attr('data-uri').substr(1);
		//where to put the information
		var wrapper = 'div.more-info';

		//checking if the page we clicked is already there
		if($(wrapper).hasClass(clickeduri)){
			//if it is, then hide it,
			$(wrapper).children().remove();
			$(wrapper).removeClass(clickeduri);
			$(this).removeClass('active');
			$('.moreInfoOverlay').removeClass('moreInfoOverlay');
			if(imgHeight > maxHeight){
				$('.links').addClass('inPic');
				centerDiv('.links');
			}
		}else{ 
			handleMoreInfoLocation();
			//$('.more-info').width($('.status-display').width() - 60 + 'px');
		//took out 60 here because it got too small on mobile.  should be same width as status-display
			$('.more-info').width($('.status-display').width() + 'px');
			centerDiv('.more-info');
			//otherwise, load the page
			$(wrapper).load(clickeduri, function(){
				$(this).ready(function(){
					/*
					if(clickeduri == '/admin') {
						$('.more-info').width($('div.status-display').width() - 20 + 'px');
					} else {
						$('.more-info').removeProp('width');
					}
					*/
				});
			});
			$('.links div').removeClass('active');
			$(this).addClass('active');
			$('.links').removeClass('inPic');
			centerDiv('.links');
			$(wrapper).removeClass('howto')
				  .removeClass('admin')
				  .removeClass('money')
				  .addClass(clickeduri);
		}
	});
});
