function signinCallback(authResult) {
  if (authResult['status']['signed_in']) {
    // Update the app to reflect a signed in user
    // Hide the sign-in button now that the user is authorized, for example:
    document.getElementById('signinButton').setAttribute('style', 'display: none');
	//authResult is the object I want to add to mysql table
/*  this is supposed to return id, but 'plus' is undefined in the next line
	var request = gapi.client.plus.people.get({
		'userId' : 'me'
	});

	request.execute(function(res){
		console.log('ID: ' + res.id);
		console.log('name: ' + res.displayName);
	});
*/
	sendSUID("google");

	console.log(authResult.access_token);
  } else {
    // Update the app to reflect a signed out user
    // Possible error values:
    //   "user_signed_out" - User is signed-out
    //   "access_denied" - User denied access to your app
    //   "immediate_failed" - Could not automatically log in the user
    console.log('Sign-in state: ' + authResult['error']);
  }
}

function sendSUID(network){
	var data = {
		network: network,
		id: global.fbID,
		name: global.fbname,
		global: global
	}
	socket.emit('social login',data);	
}
