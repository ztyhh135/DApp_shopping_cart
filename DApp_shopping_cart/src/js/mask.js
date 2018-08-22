function ShowLoginText(){
    layer.open({
        type:1,
        title:"登录",
        area:["395px","300px"],
        content:$("#loginBox"),
        });
    }
function Login(){
    var username=$.trim($("#InputUsername").val());//Get the user name trim is to remove the space
    var password=$.trim($("#InputUserPwd").val());//get password
    if(username==""||password==""){
        layer.alert("用户名或者密码不能为空!",{
        title:"提示",
        icon:5, 
        });
    }
}