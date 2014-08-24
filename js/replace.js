$(document).ready(function() {
    $('#about-me-l').click(function() {
        $('#about-me-l').attr("id", "#about-me-j");
        $('#title').text(me.name);
    });
    $('#about-me-j').click(function() {
    $('#about-me-j').attr("id", "#about-me-l");
        $('#title').text(lzr.name);
        
    });
});


var me = {
    name: "J B",
    email: "",
    twiiter: "",
    facebook: "",
    img: "",
    resume: ""
};

var lzr = {
    name: "laazer",
    email: "",
    twiiter: "",
    facebook: "",
    img: "",
    resume: ""
};