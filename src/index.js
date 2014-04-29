var Vue = require('underscore');
var Vue = require('vue');
//var sync = require("./lib/syncdb");
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
        el._iscroll.refresh();
    },
    unbind: function () {
        if(this.el._iscroll){
            this.el._iscroll.destroy();
            this.el._iscroll = null;
        }
    }
});


Vue.filter('category', function (value) {
    filter_categories = _.rest(arguments);
    this.categoryFilter;

    console.log('filter', filter_categories, this.categoryFilter)
    if (this.categoryFilter){
     filter_categories.push(this.categoryFilter);
    }

    console.log(filter_categories);
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

        console.log(item_categories, filter_categories, inter);
        return inter.length > 0
    });
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
      'categoryFilter': "",
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

        filterEvents: function(category){
            if (category == "" || category == "all" || !category){
                APP.events = DB.events;
                return;
            }
            APP.events = _.filter(DB.events, function(item){
                var it = _.pluck(item.categories, 'slug');
                return _.contains(it, category)
            });
            updateScrollers();
        }
    }


})


var startView = window.location.hash.substring(1);
if (startView.length > 2)
    APP.currentScreen = startView;



function updateScrollers(){
    walkTheDOM(document, function(node){
        if (node._iscroll){
            setTimeout(function(){
                console.log("updateng a scroller");
                node._iscroll.refresh();
            }, 500);
        }
    })
}


function walkTheDOM(node, func) {
    func(node);
    node = node.firstChild;
    while (node) {
        walkTheDOM(node, func);
        node = node.nextSibling;
    }
}








