var body = document.getElementsByTagName('body')[0];
var bgdark = document.getElementById('bgdark');
var bglight = document.getElementById('bglight');

var bgcolorstart = localStorage.getItem('bgcolor');
if (bgcolorstart == 'dark') {
    body.style.backgroundColor = '#333333';
}    

bgdark.style.cursor = 'pointer';
bgdark.onclick = function() {
    body.style.backgroundColor = '#333333';
    localStorage.setItem('bgcolor','dark');
};

bglight.style.cursor = 'pointer';
bglight.onclick = function() {
    body.style.backgroundColor = '#ffffff';
    localStorage.setItem('bgcolor','light');
};

bgdark.onmouseover = function() {
    this.style.outlineColor = '#ff154f';
};
bgdark.onmouseout = function() {
    this.style.outlineColor = '#19c97f';
};
bglight.onmouseover = function() {
    this.style.outlineColor = '#ff154f';
};
bglight.onmouseout = function() {
    this.style.outlineColor = '#19c97f';
};