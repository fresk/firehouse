var Vue = require('vue');
Vue.use(require('./lib/vue-tuio'));

require("./views")

window.DB = require("./db.json");

window.APP = new Vue({
    el: '#app',
    data: {
      currentScreen: 'home',
      events: DB.events,
      locations: DB.locations,
      sponsors: DB.sponsors
    }
})


var startView = window.location.hash.substring(1);
if (startView.length > 2)
    APP.currentScreen = startView;












