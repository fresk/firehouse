var _ = require('underscore');
var Vue = require('vue');
//var sync = require("./lib/syncdb");
//Vue.use(require('./lib/vue-tuio'));


//#TODO
// title on event list
//


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
    //this.categoryFilter;

    //console.log('filter', filter_categories, this.categoryFilter)
    //if (this.categoryFilter){
    // filter_categories.push(this.categoryFilter);
    //}

    //console.log(filter_categories);
    filter_categories = _.rest(arguments);
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








SCREENSAVER_TIMEOUT = 5;


require("./views");

window.DB = require("./db.json");

window.APP = new Vue({
    el: '#app',
    data: {
      'currentScreen': 'home',
      'events': DB.events,
      'sponsors': DB.sponsors,
      'modules': DB.modules,
      'categories': DB.categories,
      'tallslides': DB.tallslides,
      'featuredSlides': [],
      'currentEvent': {},
      'currentTallSlide': {},
      'categoryFilter': "",
      'categoryFilterName': "Upcoming Events",
      'screenSaverActive': false,
    },

    ready: function(){
        this.featuredSlides = _.filter(this.tallslides, function(slide){
            console.log("SLIDE", slide);
            return !(slide['excludeFromFeatured']);
        });

        $('.video-bg').videoBG({
            webm:this.modules['background-video'].video,
            scale:true,
        });

    },

    methods: {

        hideScreenSaver: function(){
            console.log("hide screensaver");
            APP.screenSaverActive = false;
            APP.currentScreen = 'home';
            SCREENSAVER_TIMEOUT = 5;

        },

        showEvent: function(event){
            APP.currentEvent = event;
            APP.currentScreen = 'event-detail';
        },

        showFeaturedEvent: function(event){
            APP.currentEvent = event;
            if (APP.currentScreen == 'event-detail-featured')
                APP.currentScreen = 'event-detail-featured2';
            else
                APP.currentScreen = 'event-detail-featured';
        },

        showTallSlide: function(tallslide){
            APP.currentTallSlide = tallslide;
            if (APP.currentScreen == 'tallslide')
                APP.currentScreen = 'tallslide2';
            else
                APP.currentScreen = 'tallslide';
        },

        filterEvents: function(category){
            console.log("CATEGORY", category);
            if (category == "" || category == "all" || !category){
                APP.events = DB.events;
                APP.categoryFilterName  = "Upcoming Events"
                return;
            }
            APP.events = _.filter(DB.events, function(item){
                var it = _.pluck(item.categories, 'slug');
                return _.contains(it, category)
            });
            APP.categoryFilterName  = APP.categories[category].name;
            console.log( APP.categoryFilterName, APP.categories[category], APP.categories);
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
            node._iscroll.refresh();
        }
    });
}



setInterval(function(){updateScrollers()}, 3000);

function walkTheDOM(node, func) {
    func(node);
    node = node.firstChild;
    while (node) {
        walkTheDOM(node, func);
        node = node.nextSibling;
    }
}


$(document).on("click", '.screensaver-cover', function(){
    console.log("CLICK");
    APP.hideScreenSaver();
})


setInterval(function(){
    if (APP.screenSaverActive)
        return
    SCREENSAVER_TIMEOUT = SCREENSAVER_TIMEOUT - 1;
    if (SCREENSAVER_TIMEOUT < 0){
        console.log("activating screensaver");
        APP.screenSaverActive = true;
        APP.currentScreen = 'screenSaver';
    }
}, 10000);






