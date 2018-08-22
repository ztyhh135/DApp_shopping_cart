// check if it suppose File API
if (window.File && window.FileReader && window.FileList && window.Blob) {
  //  suppose
} else {
  alert('This browser still not support for image update!');
}
$("#img_input").on("change", function(e){

  var file = e.target.files[0]; //get image source

  // pick img only
  if (!file.type.match('image.*')) {
    return false;
  }
  var reader = new FileReader();

  reader.readAsDataURL(file); // read file

  // rendering file
  reader.onload = function(arg) {

    var img = '<img class="preview" src="' + arg.target.result + '" alt="preview"/>';
    $(".preview_box").empty().append(img);
  }
});
//From here we will update to serves
var form_data = new FormData();
var file_data = $("#img_input").prop("files")[0];

// update data to form_data
form_data.append("user", "Mike");
form_data.append("img", file_data);

$.ajax({
    type: "POST", // Adopt POST for updating file
    url: "",
    dataType : "json",
    crossDomain: true, // If cross-domain is used, CORS needs to be turned on in the background
  processData: false,  // Note: no process data
  contentType: false,  // Note: Do not set contentType
    data: form_data
}).success(function(msg) {
    console.log(msg);
}).fail(function(msg) {
    console.log(msg);
});