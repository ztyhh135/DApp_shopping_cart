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
        username.innerHTML = localStorage.username; //给标签加用户名
    }
}
function login(){
  // 构造返回链接
  var returnUrl = "returnUrl=index.html";
  var Url = "login.html" + "?" + returnUrl;
  location.href = Url;
}
// firebase.auth().onAuthStateChanged(function(user) {
//   var username = document.getElementById("login_name");
// 	// If user already signed in
// 	if(email_id.length > 1) {
// 		username.innerHTML = email_id;
// 	}
// });
