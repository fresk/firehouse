 var Service = require('./node-mac').Service;

// Create a new service object
var svc = new Service({
  name:'dmsc-screens',
  script: __dirname+'/boot.js',
  logpath: __dirname
});

svc.root = process.env.HOME+"/Library/LaunchAgents";


// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  console.log("start")
  svc.start();
});

if (svc.exists){
    console.log("uninstall")
    svc.uninstall();
}
else{
    console.log("install")
    svc.install();
}
