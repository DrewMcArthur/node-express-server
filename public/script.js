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
	} else { //otherwise, just set the height
		$('div.status-display').height(imgHeight + 'px');
	}

	//bottom button handling
	$('.links div').on('click',function(){
		//link of the button we clicked
		var clickeduri = $(this).attr('data-uri');
		//where to put the information
		var wrapper = 'div.more-info';

		//checking if the page we clicked is already there
		if($(wrapper).hasClass(clickeduri)){
			//if it is, then hide it,
			$(wrapper).children().remove();
			$(wrapper).removeClass(clickeduri);
			$(this).removeClass('active');
		}else{ 
			//otherwise, load the page
			$(wrapper).load(clickeduri);
			$('.links div').removeClass('active');
			$(this).addClass('active');
			$(wrapper).removeClass('/howto')
				  .removeClass('/admin')
				  .removeClass('/money')
				  .addClass(clickeduri);
		}
	});
});
