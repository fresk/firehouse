global.Element = Element;
global.document = window.document;
global.navigator = window.navigator;

var gui = require('nw.gui');

var CONFIG = require('./config.json');

// go full kiosk on actuall production
var win = gui.Window.get();
if(CONFIG.fullscreen){
    win.enterKioskMode();
    win.enterKioskMode();
}
else {
    var devtools = win.showDevTools();
    devtools.moveTo(600,25);
    win.moveTo(0,25);
}

$(function(){
    setInterval(function(){
        var t = $('iframe').contents().find("title").text();
        if (t != 'appstract')
            window.location.reload();
    }, 1000);
});

