var causewayStatus = false;
var socket = io();
socket.on('update', function(data){
	setCausewayStatus(data);
});
var setCausewayStatus = function(stat){
	causewayStatus = stat;
	if(stat)
		$('#status').text("Open");
	else
		$('#status').text("Closed");
}
var toggleCausewayStatus = function(){
	setCausewayStatus(!causewayStatus);
}
$(document).ready(function(){
	$('.links div').on('click',function(){
		var clickeduri = $(this).attr('data-uri');
		var wrapper = 'div.more-info';

		//checking if the page we clicked is already there
		if($(wrapper).hasClass(clickeduri)){// && $(wrapper).children().length > 0){
			//if it is, then hide it,
			$(wrapper).children().remove();
			$(wrapper).removeClass(clickeduri);
		}else{ 
			//otherwise, load the page
			$(wrapper).load(clickeduri);
			$(wrapper).removeClass('/howto')
				  .removeClass('/admin')
				  .removeClass('/money')
				  .addClass(clickeduri);
		}
	});
});
