// Initialize Firebase

var config = {
  apiKey: "AIzaSyDRGgmMTpcB64h5Na9opZ93DsCD_cV147o",
  authDomain: "mango-magic.firebaseapp.com",
  databaseURL: "https://mango-magic.firebaseio.com",
  projectId: "mango-magic",
  storageBucket: "mango-magic.appspot.com",
  messagingSenderId: "590370440474"
};
firebase.initializeApp(config);
firebase.auth().onAuthStateChanged(function(user) {
	var user = firebase.auth().currentUser;

	if (user) {
		if(user != null){
			var email_www = user.email;
			$('#user_name').text(email_www);
			$('#user_name').attr('href','account.html');
			$('.log_hide').css('display','none');
			$('.log_show').css('display','block');
		}
	}else {
		$('.log_hide').css('display','block');
		$('.log_show').css('display','none');
	}

});

function logout(){
  firebase.auth().signOut();
  window.location.href = "index.html";
}
