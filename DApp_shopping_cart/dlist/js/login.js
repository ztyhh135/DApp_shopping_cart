// References: Firebase Documentation
// https://firebase.google.com/docs/auth/?authuser=0

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
  // If user already signed in
  if (user) {
    document.getElementById("user_div").style.display = "block";
    document.getElementById("login_div").style.display = "none";

    var user = firebase.auth().currentUser;

    if(user != null){
      var email_id = user.email;
      document.getElementById("user_para").innerHTML = "Welcome User : " + email_id;
      // window.location.href = "personal.html";
    }
  } else {
    // No user is signed in.


    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "block";

  }

});



function login(){

  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;
  var ad = 0;
  firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error,ad) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode === 'auth/wrong-password') {
            window.ad = 1;
            alert('Wrong password.');
          } else {
            window.ad = 1;
            alert(errorMessage);
          }
          console.log(error);
  }).then(function(res){
    if(res){
      window.location.href = "index.html";
    }
  });
  // var prevLink = document.referrer;
  // if($.trim(prevLink)==''){
  //   location.href = 'index.html';
  // }else{
  //   location.href = prevLink;
  // }

  // console.log(ad);
  // if(ad == 0){
  //     sessionStorage.username = userEmail;
  //     // var url = location.search.split("=")[1];
  //     location.href = "index.html";
  //     console.log(localStorage.username)
  // }
}

// User log out 
function logout(){
  firebase.auth().signOut();
  window.location.href = "index.html";
}


// new user sign up
function signupWithEmail(){

  var email = document.getElementById("new_email_field").value;
  var password = document.getElementById("new_password_field").value;

  if (email.length < 4) {
    alert('Please enter an email address.');
    return;
  }
  if (password.length < 4) {
    alert('Please enter a password.');
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
    var e_address = document.getElementById("ethereum_address").value;
    var user = firebase.auth().currentUser;
    var userId = user.uid;
    firebase.database().ref('users/' + userId).update({
        address: e_address
      });
    document.getElementById("container01").style.display = "none";
    window.location.href = "index.html";
  }, function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/weak-password') {
      alert('The password is too weak.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
  });



}