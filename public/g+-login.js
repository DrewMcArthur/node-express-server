function signinCallback(authResult) {
  if (authResult['status']['signed_in']) {
	gapi.auth.setToken(authResult);
	document.getElementById('signinButton').setAttribute('style', 'display: none');
	getSignUpEmail();
	sendSUID("google",global);
  } else {
    // Update the app to reflect a signed out user
    // Possible error values:
    //   "user_signed_out" - User is signed-out
    //   "access_denied" - User denied access to your app
    //   "immediate_failed" - Could not automatically log in the user
    //	console.log('Sign-in state: ' + authResult['error']);
  }
}
/*
function sendSUID(network){
	var data = {
		network: network,
		global:global
	}
	socket.emit('social login',data);	
}
*/

function getSignUpEmail(){
    // Load the oauth2 libraries to enable the userinfo methods.
    gapi.client.load('oauth2', 'v2', function() {
        var request = gapi.client.oauth2.userinfo.get();
    });

    gapi.client.load('plus','v1', function(){
     var request = gapi.client.plus.people.get({
       'userId': 'me'
     });
     request.execute(function(resp) {
	global.gID = resp.id;
	global.gname = resp.displayName;
     });
    });
}
