$(function() {

    $('#leftNavigation').ssdVerticalNavigation();

});

$(function(){
    tabs($("#tabs01 a"), $('#contentRight .con'));
})

var tabs = function(tab, con){
    tab.click(function(){
        var indx = tab.index(this);
        tab.removeClass('current');
        $(this).addClass('current');
        con.hide();
        con.eq(indx).show();
    })
}