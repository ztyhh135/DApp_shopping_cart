// References: Firebase Documentation
// https://firebase.google.com/docs/storage/?authuser=0

if (!(window.File || window.FileReader || window.FileList || window.Blob)) {
    alert('adopt chrome please！');
}
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


function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}


//get file name
function getFileName(path) {
    var pos1 = path.lastIndexOf('/');  
    var pos2 = path.lastIndexOf('\\');  
    var pos = Math.max(pos1, pos2);  
    if (pos < 0) {
        return path;
    }
    else {
        return path.substring(pos + 1);
    }
}
// $(document).ready(function () {  
//     $('#file').change(function () {  
//         var str = $(this).val();  
//         var fileName = getFileName(str);  
//         var fileExt = str.substring(str.lastIndexOf('.') + 1);   
//         alert(fileName + "\r\n" + fileExt);  
//     });  
// }); 

 //get time
function nowtime(){
   var myDate = new Date();
  //get the year
  var year=myDate.getFullYear();
  //get the month
  var month=myDate.getMonth()+1;
  //get the day
  var date=myDate.getDate();
  var h=myDate.getHours();       //get the hours(0-23)
  var m=myDate.getMinutes();     //get minutes(0-59)
  var s=myDate.getSeconds();

  var now=year+p(month)+p(date)+p(h)+p(m)+p(s);
  return now;
}
//exchange form
function p(s) {
  return s < 10 ? '0' + s: s;
}

$(window).load(function() {
      var options =
      {
        thumbBox: '.thumbBox',
        spinner: '.spinner',
        // imgSrc: 'img/5.jpg'
      }
      var cropper = $('.imageBox').cropbox(options);
      $('#upload-file').on('change', function(){

        var str = $(this).val();  
        var fileName = getFileName(str);
        fileName =fileName.substring(fileName.lastIndexOf('/')+1, fileName.lastIndexOf('.'));
        // var fileExt = str.substring(str.lastIndexOf('.') + 1);
        // alert(fileName + "\r\n" + fileExt);


        var reader = new FileReader();
        reader.onload = function(e) {
          options.imgSrc = e.target.result;
          // console.log(options);
          cropper = $('.imageBox').cropbox(options);
        }
        reader.readAsDataURL(this.files[0]);
        console.log(this.files[0]);
        this.files = [];
      })
      $('#btnCrop').on('click', function(){
        var img = cropper.getDataURL();
        // var imgName = cropper.getName();
        var time = nowtime();
        var file = dataURLtoFile(img, time);
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

          }

          console.log(downloadURL);
        });
      })
      $('#btnZoomIn').on('click', function(){
        cropper.zoomIn();
      })
      $('#btnZoomOut').on('click', function(){
        cropper.zoomOut();
      })
    });





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