/*
 * Drew McArthur   -   chat.js
 * 4/19/18
 *
 * this file is the client side javascript to communicate between the web page
 * itself and the server. when the page is opened, a socket connection 
 * to the server is initialized, which can then be listened to or used to 
 * send messages with commands.
 ******************************************************************************/


// create the socket connection
var socket = io();

// listen for events from the server
socket.on('btn press', function(msg){
  console.log(msg);
});

// use jquery to send event messages to the server
$('btn').on('click', function(e) {
  socket.emit('btn press', '');
}

$(document).ready(function(){
	var messageheight = $(document).height()-$('form').height();

  //max height of the messages div should be the ( document height - 
  // the height of the input bar ), any larger would be scrolled
	$('#messages').css('max-height',messageheight); 

  //sets bottom of the messages (position:fixed) to 6 more than 
  // the height of the input bar
	$('#messages').css('bottom',$('form').height()+6); 

  // set a variable to check if the user is looking at the browser tab.  
  // used for notifications.
	$([window, document]).focusin(function(){ 
    global.isWindowFocused = true; 
    if(n != undefined){ 
      n.close() 
    }
  }).focusout(function(){ 
    global.isWindowFocused = false; 
  }); 

  //if mobile, shrink website, I don't know why i do this.
	if(global.isMobile){ $("body").width($(window).width()); } 

  // put focus in input box
	$('input#m').focus(); 
});

function notifyMe(msg){
	function createNotification(msg){
  //if a notificiation exists, close it and display the new one
		if(n != undefined){n.close()}; 
		n = new Notification("New Message from " + msg.name + "...",{
			body: msg.body
		});
		n.onshow = function(){
  //close the notification after 5 seconds
			setTimeout(n.close,5000); 
		},
		n.onclick = function(){
  //if the user clicks, open the chat window, 
			window.focus(); 
  // close the notification
			n.close(); 
		}
	}
  // If the user agreed to get notified
	
	// Let's try to send ten notifications
  //if they said yes to notifications,
	if (window.Notification && Notification.permission === "granted") { 
		createNotification(msg);
	}

	// If the user hasn't told if he wants to be notified or not
	// Note: because of Chrome, we are not sure the permission property
	// is set, therefore it's unsafe to check for the "default" value.
  //if they didn't
	else if (window.Notification && Notification.permission !== "denied") { 
  // then just ask again!
		Notification.requestPermission(function (status) { 
  // if they answered differently, change the variable
			if (Notification.permission !== status) { 
				Notification.permission = status;
			}

  // if they said yes
			if (status === "granted") { 
				createNotification(msg);
			}
		});
	}
}
