var _ = require('underscore');
var Vue = require('vue');
//var sync = require("./lib/syncdb");
//Vue.use(require('./lib/vue-tuio'));

Vue.directive('scroll', {

    bind: function () {
        var self = this;
        function refresh(){
            if (self.el._iscroll)
                self.el._iscroll.refresh();
            else
                setTimeout(refresh, 200);
        }
        var options = {tap: true};
        self.el._iscroll = new IScroll(self.el, options);
        setTimeout(refresh, 200);
    },
    update: function (value) {
        // do something based on the updated value
        // this will also be called for the initial value
        //console.log("update iScroll");
        if (this.el._iscroll)
        el._iscroll.refresh();
    },
    unbind: function () {
        if(this.el._iscroll){
            this.el._iscroll.destroy();
            this.el._iscroll = null;
        }
    }
});



var _filterEvents = function(value){
     filter_categories = _.rest(arguments);
    this.categoryFilter;

    //console.log('filter', filter_categories, this.categoryFilter)
    if (this.categoryFilter){
     filter_categories.push(this.categoryFilter);
    }

    //console.log(filter_categories);
    if (filter_categories.length == 0)
        return value;

    return _.filter(value, function(item){
        var item_categories = _.map(item.categories, function(i){
            return i.slug;
        });

        var inter = _.intersection(
            item_categories,
            filter_categories
        );

        //console.log(item_categories, filter_categories, inter);
        return inter.length > 0
    });
}



Vue.filter('category', function (value) {
    return _filterEvents(arguments);
})


Vue.filter('qrcode', function (value, size) {
    if (!size){
        size = 400;
    }
    var url = "https://chart.googleapis.com/chart?chs=";
    url += size+"x"+size+"&";
    url += "cht=qr&chl="+encodeURIComponent(value);
    return url;
})




var SCRENSAVER_INTERVAL = 5000; //ms between each slide
var SCRENSAVER_COUNTDOWN = 60; //how many "intervals" before starting screensaver

function setupScreenSaver(){

    var screenSaverSlides = [];
    _.forEach(_filterEvents(DB.events, 'featured-event'), function(event){
        screenSaverSlides.push({'screen': 'event-detail-featured', 'data': event});
    });
    _.forEach(APP.tallslides, function(slide){
        screenSaverSlides.push({'screen': 'tallslide', 'data': slide});
    });

    var stopScreenSaver = function(){
        if (APP.screenSaverActive){
            console.log("stoping screensaver");
            APP.screenSaverTimer = SCRENSAVER_COUNTDOWN;
            APP.screenSaverActive = false
            APP.currentScreen = 'home'
        }
    };

    $(document).on('click', stopScreenSaver);
    $(document).on('touchstart', stopScreenSaver);

    setInterval(function(){
        APP.screenSaverTimer--;
        console.log("screensaver countdown:", APP.screenSaverTimer);
        if (APP.screenSaverTimer <= 0){
            console.log("starting screensaver");
            APP.screenSaverActive = true;
            slide = _.sample(screenSaverSlides);
            //console.log(slide);
            if (slide.screen == 'event-detail-featured')
                APP.showFeaturedEvent(slide.data);
            else if (slide.screen == 'tallslide')
                APP.showTallSlide(slide.data);
        }
    }, SCRENSAVER_INTERVAL);

}



require("./views");

window.DB = require("./db.json");

window.APP = new Vue({
    el: '#app',
    data: {
      'currentScreen': 'home',
      'events': DB.events,
      'sponsors': DB.sponsors,
      'modules': DB.modules,
      'tallslides': DB.tallslides,
      'currentEvent': {},
      'currentTallSlide': {},
      'categoryFilter': "",
      'screenSaverActive': false,
      'screenSaverTimer': SCRENSAVER_COUNTDOWN,
    },

    ready: function(){
        setTimeout(setupScreenSaver, 1000);

    },

    methods: {
        syncDB: function(){
            window.DB = sync.syndb();
            this.locations = DB.locations;
            this.sponsors = DB.sponsors;
            this.modules = DB.modules;
            this.tallslides = DB.tallslides;
            this.events = DB.events;
            this.categoryFilter = "";
            this.currentScreen = "home";
        },

        showEvent: function(event){
            APP.currentEvent = event;
            APP.currentScreen = 'event-detail';
        },

        showFeaturedEvent: function(event){
            APP.currentEvent = event;
            APP.currentScreen = 'event-detail-featured';
        },

        showTallSlide: function(tallslide){
            APP.currentTallSlide = tallslide;
            APP.currentScreen = 'tallslide';
        },

        filterEvents: function(category){
            if (category == "" || category == "all" || !category){
                APP.events = DB.events;
                return;
            }
            APP.events = _.filter(DB.events, function(item){
                var it = _.pluck(item.categories, 'slug');
                return _.contains(it, category)
            });
            Vue.nextTick(function(){updateScrollers()});
        }
    }


})



$(window).on('hashchange', function() {
    var screenTarget = window.location.hash.substring(1);
    if (screenTarget.length > 2){
        if (Vue.component(screenTarget))
            APP.currentScreen = screenTarget;
        else
            APP.currentScreen = 'home';

        window.location.hash = "#";
    }
});



function updateScrollers(){
    walkTheDOM(document, function(node){
        if (node._iscroll){
            setTimeout(function(){
                //console.log("updateng a scroller");
                node._iscroll.refresh();
            }, 700);
        }
    });
}


function walkTheDOM(node, func) {
    func(node);
    node = node.firstChild;
    while (node) {
        walkTheDOM(node, func);
        node = node.nextSibling;
    }
}








