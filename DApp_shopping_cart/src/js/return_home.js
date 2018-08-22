// Initialize Firebase
// var config = {
//   apiKey: "AIzaSyDRGgmMTpcB64h5Na9opZ93DsCD_cV147o",
//   authDomain: "mango-magic.firebaseapp.com",
//   databaseURL: "https://mango-magic.firebaseio.com",
//   projectId: "mango-magic",
//   storageBucket: "mango-magic.appspot.com",
//   messagingSenderId: "590370440474"
// };
// firebase.initializeApp(config);
var username = document.getElementById("login_name");
window.onload = function(){
    if(localStorage.username.length>1){
        username.innerHTML = localStorage.username; //Add a user name to the tag
    }
}
function login(){
  // Construct return link
  var returnUrl = "returnUrl=index.html";
  var Url = "login.html" + "?" + returnUrl;
  location.href = Url;
}

