//gulp needs to have cwd be the project root
process.chdir(__dirname+"/../");

var fs = require('fs');
var mkdirp = require('mkdirp');
var spawn = require('child_process').spawn;
var socket_io = require('socket.io-client');
var gulp = require(__dirname+"/../gulpfile.js");


var socket = socket_io.connect("http://dmsc.fresk.io:7100");
socket.on('connect', function(){
    console.log("connected to dmsc.fresk.io")
    socket.on('message', function(data){
        console.log("MESSAGE", data)
    });
    socket.on('screens', function(data){
        console.log("SCREENS:", data)
        if (data == "syncdb") {

            gulp.start("syncdb", function(){
                console.log("DONE SYNCING");

            })
        }
        if (data == "reboot"){
            console.log("reboot")
            process.exit(1);
        }
        else {
            gulp.start(data)
        }
    });
});

function messageHandler(msg){
    console.log("received msg:", msg);
}

gulp.start("build", function(err){
    console.log("build done");
    gulp.start("connect", function(err){
        if(err) console.log("app server exit", err);
    });
    gulp.start("watch", function(err){
        if(err) console.log("watch server exit", err);
    });
});


var mt_platform_bin = "/Applications/MultiTouchPlatform.app/Contents/MacOS/MultiTouchPlatform";
var mt_platform = spawn(mt_platform_bin,[],{env: process.env, stdio: 'inherit'})
mt_platform.on('error', function(err){
    console.log("mt_platform error", arguments);
    if (err)
        process.exit(1);
});
mt_platform.on('exit', function(code, signal){
    console.log("mt_platform exit", arguments);
    if (code)
        process.exit(1);
});

var nw_bin = "/Applications/node-webkit.app/Contents/MacOS/node-webkit";
var node_webkit = spawn(nw_bin, [__dirname], { env: process.env, stdio: 'inherit'})
node_webkit.on('error', function(err){
    console.log("node-webkit error", arguments);
    process.exit(1);
})
node_webkit.on('exit', function(err){
    console.log("node-webkit exit", arguments);
    process.exit(1);
});


process.on('exit', function(err) {
  console.log('Exit: ' + err);
  shutdown();
});

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  shutdown();
});


function shutdown(){
  mt_platform.kill("SIGINT");
  node_webkit.kill("SIGINT");
  process.exit(1);
}

