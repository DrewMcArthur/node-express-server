$(document).ready(function(){
	//select the current status
	if(status) $('.open').addClass('active');
	else $('.closed').addClass('active');

	//match button size
	//$('.status-btns .open').width($('.status-btns .closed').width()+'px');

	//handle button clicking
	$('.status-btns div').on('click', function(){
		if(!$(this).hasClass('active'))
			$('.status-btns div').removeClass('active');
			$(this).addClass('active');
	});

	//submit form
	$('.update-btn').on('click', function(){
		var data = {};
		data.stat = $('.open').hasClass('active');
		data.pw = $('.pw').val().hashCode();
		socket.emit('admin-update', data);
		$('input.pw').val('');
	});
	//handle server response 
	socket.on('correct-pass',function(){
		$('input.pw').attr('placeholder', 'password');
		$('.links .admin').click();
	});
	socket.on('incorrect-pass', function(){
		$('input.pw').attr('placeholder', 'incorrect');
	});
});
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

