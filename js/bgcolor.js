var body = document.getElementsByTagName('body')[0];
var navs = document.getElementsByClassName('nav');
var bgdark = document.getElementById('bgdark');
var bglight = document.getElementById('bglight');

function setDark() {
    body.classList.add("bg-dark");
    body.classList.remove("bg-light");
    for (let element of navs) {
        element.classList.add("nav-dark");
        element.classList.remove("nav-light");
    }
    localStorage.setItem('bgcolor','dark');
}

function setLight() {
    body.classList.add("bg-light");
    body.classList.remove("bg-dark");
    for (let element of navs) {
        element.classList.add("nav-light");
        element.classList.remove("nav-dark");
    }
    localStorage.setItem('bgcolor','light');
}

var bgcolorstart = localStorage.getItem('bgcolor');
if (bgcolorstart == 'light') {
    setLight();
} else if(bgcolorstart == 'dark') {
    setDark();
}

bgdark.onclick = setDark;
bglight.onclick = setLight;