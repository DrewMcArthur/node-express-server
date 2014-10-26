var socket = io();
var global = {
	fbID: '',
	UID: '',
	name: '',//defines user's name
	isMobile: '', //boolean if device is mobile
	isTyping: '', //boolean if user is typing;
	nameChanged: '', //boolean if user has changed their name
	mutedList: [], //list of names user has muted
	numOfMessages: 0, //current number of messages locally
	isWindowFocused: '', //boolean if window is open
	notificationHardSwitch: true, //user defined yes or no to notifications, true by default
	sociallyLoggedIn: false // if user has logged in with ( fb || google )
}
//if(global.sociallyLoggedIn){$('db:login-button').remove();$("span#signinButton").remove();};

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) { 
	//tests if device is a hand held and creates boolean isMobile  (true if mobile, else false)
	global.isMobile = true; 
}else{
	global.isMobile = false;
} 
socket.on('name is', function(nameReceived){
	global.name = nameReceived;
});
socket.on('UID is', function(UIDReceived){
	global.UID = UIDReceived;
});

socket.on('ask if typing', function(){ //when the server asks if the user is typing
	if($('#m').val()){  //the client checks the value of the input, and if there's anything there, i.e user is typing
		global.isTyping = true;  // client sets a variable accordingly
	} else {
		global.isTyping = false;
	}
	var userTyping = { 
		name:global.name,
		isTyping:global.isTyping 
	}; //make a variable as an object of the username and boolean whether or not they're typing
	socket.emit('typing checked', userTyping); // reply to the server that the user is or is not typing with that object.
});

socket.on('typing message', function(userTyping){ // whenever a client responds to the server, then the server sends a reply to all clients.  
	userTyping.nameID = userTyping.name.replace(/\s/g,"");  // this is to prevent bad id's on the elements by username
	if(userTyping.isTyping && !$('#'+userTyping.nameID).length && userTyping.name!=global.name){  
	// if a user is typing, and the typing element for that user does not yet exist, and the user that is typing is NOT the user of this client, then
		if(!$('#messages div.typingMessage').length){
			$('#messages').append("<div class=\"typingMessage\" id=\""+userTyping.nameID+"P\"></div>"); //append a message that says they're typing.
		}
			$('#messages div.typingMessage').append("<div id=\""+userTyping.nameID+"\">"+userTyping.name+" is typing...</div>"); //append a message that says they're typing.
	$('#messages').scrollTop($('#messages')[0].scrollHeight); //and scroll to the bottom of the page
	} else {
		if(!userTyping.isTyping && ($('#'+userTyping.nameID).length || $('#'+userTyping.nameID+'P').length )){ //if the specific user is not typing, and the typing message exists
			$('#'+userTyping.nameID).remove(); // find the typing message for that user, and remove it. 
			$('#'+userTyping.nameID+'P').remove(); // find the typing message for that user, and remove it. 
		}
	}
});

$('form').submit(function(){ //when user presses 'send'
	if($('#m').val()){ //prevents sending of blank messages
		var firstLetter = $('#m').val().charAt(0);
		if(firstLetter=="/"){
			clientCommand($('#m').val());
			$('#m').val(''); //clear form
			global.isTyping = false;
			var userTyping = { name:global.name,isTyping:global.isTyping };
			socket.emit('typing checked', userTyping);
		}else{
			socket.emit('chat message', $('#m').val()); 
			//send an event 'chat message' to the server
			$('#m').val(''); //clear form
			global.isTyping = false;
			var userTyping = { name:global.name,isTyping:global.isTyping };
			socket.emit('typing checked', userTyping);
		}
	}
	return false;
}); //end form submit function

socket.on('chat message', function(msg){addChatMessage(msg)}); //when the server sends a chat message, add that chat message
socket.on('pm sent',function(pmData){
	if(global.UID == pmData.toUID){
		var pmsg = {
			name: pmData.from,
			timestamp: pmData.timestamp,
			body: pmData.body,
			isPM: "true"
		}
		addChatMessage(pmsg);
	}
	if(global.UID == pmData.fromUID){
		var pmsg = {
			name: pmData.from,
			timestamp: pmData.timestamp,
			body: "To "+pmData.to +": "+pmData.body,
			isPM: "true"
		}
		if(pmData.toUID == -1){
			pmsg.body = "Error, the user you specified wasn't online.";
			pmsg.name = "Server";
		}
		addChatMessage(pmsg);
	}
});

function addChatMessage(msg){
	global.numOfMessages++;
	$('#messages').append(
		'<div id=\"'+global.numOfMessages+'\" class=\"message-contain message '+ msg.name + '\">' + 
			'<div class = \"name\">' + msg.name + "</div>" +
			'<div class = \"body\">' + msg.body + "</div>" +
		'</div>'
	);
	$('#messages').scrollTop($('#messages')[0].scrollHeight); //and scroll to the bottom of the page
	$('.'+global.name).addClass('self');//finds messages with the class of the current user, and adds a class to show that the user posted that message.
	$('.'+global.name).addClass('self');//finds messages with the class of the current user, and adds a class to show that the user posted that message.
	if(global.mutedList.indexOf(msg.name) > -1){$('#'+global.numOfMessages).addClass("hidden");} //if the user is on the mutedList, make their message hidden.  
	if(!(typeof msg.isPM === 'undefined')){$('#'+global.numOfMessages).addClass("pm");} //if the isPM data value is set, then add the 'pm' css class
	if($('#messages #'+(global.numOfMessages-1)).hasClass(msg.name)){ 
		$('#messages div.message-contain:last-child div.name').addClass('hidden');
	}
	if($('#messages div.typingMessage').length){ 
		$('#messages div.message:last-child').insertBefore($('#messages div.typingMessage')); //if someone is typing, insert the message before that.
	}
	if(global.notificationHardSwitch && !global.isWindowFocused && msg.name !== "Server" && msg.name !== global.name){
		notifyMe(msg);
	}
}

/*
function mobileInputLocation(){
	if(isMobile){
		if($('#m').val()){
			/*
			$('#messages').css('max-height', ($(document).height()-42)/2);
			$('body').scrollBottom($('body')[0].scrollHeight);
			*/
/*
			$('#messages').css('margin-top','50%');
//			$('form').css('bottom','50%');
		}else{
//			$('form').css('bottom','0');
		}
	}
}
*/
function clientCommand(com){
	com = com.replace(/\//,"").toLowerCase();
	if( com.indexOf("help") > -1 || com.indexOf("?") > -1 ) {
		commandHelp(com);
	}else if(com.indexOf("name") > -1 && com.indexOf("name") < 2){
		//if(com.indexOf("set") > -1){
		//	nameSet = com.replace(/name\s*set\s*/,"");
	//		socket.emit('set ip name', nameSet);
	/*	} else*/ if(com.replace(/\s+/g,"")=="name"){	
			addChatMessage(serverMessage("Your name is " + global.name));
//		} else if(!global.nameChanged){
		} else {
			var nameID = global.name.replace(/\s/g,"");  // this is to prevent bad id's on the elements by username
			$('#'+nameID).remove(); // find the typing message for that user, and remove it, since that user no longer exists. // should probably add .typingMessage on to selector.
			var arg = com.replace(/name\s*/,""); 
			if(arg.replace(/\s*/g,"") != arg){ //test if name has spaces, don't allow that
				addChatMessage(serverMessage("Sorry, names can't have spaces, try again."));
			} else { //if no spaces, then set the name
				global.name = com.replace(/name\s*/,"");
				if(global.name!=""){
					var answerArgs = {
						name: global.name,
						sociallyLoggedIn: global.sociallyLoggedIn,
						gid: global.gID,
						fbid: global.fbID,
					}
					socket.emit('answer name', answerArgs); // and answer the server
					global.nameChanged = true;
				}
			}
/*
		} else {
			var message = {name:"Error",body:"You've already changed your name and we only allow you to do that once, sorry."};
			addChatMessage(message);
*/
		}
	}else if(com.indexOf("online") > -1 && com.indexOf("online") < 2){
		socket.emit("ask who is online");
	}else if(com.indexOf("mute") > -1 && com.indexOf("mute") < 2){
		if(com.replace(/\s+/g,"")=="mute"){	
			addChatMessage(serverMessage("Who would you like to mute? Type it like this: \n/mute username"));
		} else {
			var muted = com.replace(/mute\s+/g,"");
			if(!(global.mutedList.indexOf(muted) > -1)){ 
//				mutedList += muted + ", "; //assuming the name isn't already on the list, add the name you're muting onto the list
				global.mutedList[mutedList.length] = muted; //assuming the name isn't already on the list, add the name you're muting onto the list
			} else {
				global.mutedList.splice(global.mutedList.indexOf(muted),1);
			}
		}
	}else if(com.indexOf("pm") > -1 && com.indexOf("pm") < 2){
		com = com.replace(/pm\s*/,"");
		var toName = com.replace(/\s.*/,"");
		var reg = new RegExp(toName+"\\s*");
		var msgBody = com.replace(reg,"");
		var pmData = {
			from:global.name,
			to:toName,
			timestamp:(new Date()).toLocalString(),
			body:msgBody
		}
		socket.emit("pm",pmData);
	}else if(com.indexOf("notify") > -1 && com.indexOf("notify") < 2){
		com = com.replace(/notify\s*/,"");
		if(com == ""){
			addChatMessage(serverMessage("Your notification setting is set to " + global.notificationHardSwitch));
		}else if (com == "on" || com == "true" || com == "y" || com == "yes") { global.notificationHardSwitch = true; 
		}else if (com == "off" || com == "false" || com == "n" || com == "no") { global.notificationHardSwitch = false; 
		}else { addChatMessage(serverMessage("Sorry, that didn't change your notification setting. Try again with on/off, true/false, or yes/no.")); }
	}else{
		var message = {name:"Server",body:"Error: Sorry, I don't have a help message for \"" + com +"\". Was it a typo? If you didn't mean to type a command, try again without the / in front."};
		addChatMessage(message);
	}
}

function serverMessage(msgBody) { 
        msgFromServer = {
                name:"Server",
                timestamp:(new Date()).toLocalString(),
                body:msgBody
        }
        return msgFromServer;
}

function commandHelp(com){
	//insert here what you'll do as a function of the command input by the client
	addChatMessage(serverMessage("/Online returns the names of users currently online.\n/name changes your name.  This can only be done once per connection.\n"));
}

Date.prototype.toLocalString = function() { // concat time strings to form one with format YYMMDDhhmmss
	function pad(number) { // used for time, to make sure the date isn't returned as 1491 instead of 140901
	  if ( number < 10 ) { 
	    return '0' + number;
	  }
	  return number;
	}

	return (
		"" + 
		pad( this.getYear() - 100 ) +
		pad( this.getMonth() + 1 ) +
		pad( this.getDate() ) +
		pad( this.getHours() ) +
		pad( this.getMinutes() ) +
		pad( this.getSeconds() )
	);
};

$(document).ready(function(){
	var messageheight = $(document).height()-$('form').height();
	$('#messages').css('max-height',messageheight); //max height of the messages div should be the ( document height - the height of the input bar ), any larger would be scrolled
	$('#messages').css('bottom',$('form').height()+6); //sets bottom of the messages (position:fixed) to 6 more than the height of the input bar
	$([window, document]).focusin(function(){ global.isWindowFocused = true; }).focusout(function(){ global.isWindowFocused = false; });
	if(global.isMobile){
		$("body").width($(window).width());
	}
});

function notifyMe(msg){
    // If the user agreed to get notified
    // Let's try to send ten notifications
    if (window.Notification && Notification.permission === "granted") {
	var n = new Notification("New Message from " + msg.name + "...", {body: msg.body});
	n.onshow = function(){setTimeout(n.close.bind(n),5000);};
    }

    // If the user hasn't told if he wants to be notified or not
    // Note: because of Chrome, we are not sure the permission property
    // is set, therefore it's unsafe to check for the "default" value.
    else if (window.Notification && Notification.permission !== "denied") {
      Notification.requestPermission(function (status) {
        if (Notification.permission !== status) {
          Notification.permission = status;
        }

        // If the user said okay
        if (status === "granted") {
            var n = new Notification("Hi! ", {tag: ''});
        }

        // Otherwise, we can fallback to a regular modal alert
        else {
          alert("Hi!");
        }
      });
    }

    // If the user refuses to get notified
    else {
      // We can fallback to a regular modal alert
      alert("Hi!");
    }
}

