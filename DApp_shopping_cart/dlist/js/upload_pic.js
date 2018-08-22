// References: Firebase Documentation
// https://firebase.google.com/docs/storage/?authuser=0

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
var storageRef = firebase.storage().ref();

var uploadFileInput = document.getElementById("uploadFileInput");
uploadFileInput.addEventListener("change", function(){
	var file = this.files[0];
  var uploadTask = storageRef.child('img/'+file.name).put(file);
  uploadTask.on('state_changed', function(snapshot){
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
    }
  }, function(error) {
    // Handle unsuccessful uploads
  }, function() {
    // Handle successful uploads on complete
    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    var downloadURL = uploadTask.snapshot.downloadURL;
    var d1 = document.getElementById("item_img");
    var img = document.createElement("img");
    img.src=downloadURL;
    img.id="item_img_pic";
    if($("#item_img:has(img)").length == 0){
      d1.appendChild(img);
    }
    else
    {
      $("#item_img_pic").attr('src', downloadURL);
      // console.log($("#item_img_pic").attr(src));
    }
    

    console.log(downloadURL);
  });
},false);



firebase.auth().onAuthStateChanged(function(user) {
  var user = firebase.auth().currentUser;

  if (user) {
    if(user != null){
      var email_www = user.email;
      //alert('login user is' + email_id);
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