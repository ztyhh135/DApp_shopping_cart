$(function(){
    tabs($("#tabs01 a"), $('#container01 .con'));
})

var tabs = function(tab, con){
    tab.click(function(){
        $('#container01').show();
        $("#forgot_div").hide();
        var indx = tab.index(this);
        tab.removeClass('current'+' selected');
        $(this).addClass('current'+' selected');
        con.hide();
        con.eq(indx).show();
    })
}
function forget(){
    $("#forgot_div").show();
    $('#container01').hide();
}
function Send(){
	var email1 = $('#email_forget').val();
	firebase.auth().sendPasswordResetEmail(email1);
	$("#forgot_div").css('display','none');
	$('#container01').css('display','block');
	window.alert("Reset passwrord email has sent to you.")
}