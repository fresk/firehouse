var Vue = require('vue');
//Vue.use(require('./lib/vue-tuio'));

Vue.directive('scroll', {

    bind: function () {
        var el = this.el;
        var options = {tap: true};
        el._iscroll = new IScroll(this.el, options);
        setTimeout(function(){
            el._iscroll.refresh();
            console.log("refresh")
        }, 200);
    },
    update: function (value) {
        // do something based on the updated value
        // this will also be called for the initial value
        console.log("update iScroll");
    },
    unbind: function () {
        if(this.el._iscroll){
            this.el._iscroll.destroy();
            this.el._iscroll = null;
        }
    }
});



require("./views");

window.DB = require("./db.json");

window.APP = new Vue({
    el: '#app',
    data: {
      currentScreen: 'home',
      events: DB.events,
      locations: DB.locations,
      sponsors: DB.sponsors
    },

    methods: {
        showEvent: function (item) {
            console.log(item);
            APP.currentScreen = 'event-detail';
        }
    }



})


var startView = window.location.hash.substring(1);
if (startView.length > 2)
    APP.currentScreen = startView;












