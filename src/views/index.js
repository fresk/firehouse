var Vue = require('vue');

Vue.component('dropdown', {
    data: {
        'show' : false
    },

    methods: {
        setFilter: function(filter){
            APP.filterEvents(filter);
            this.show = false;
        }

    }
});



Vue.component('home', {
    template: require("./home.html"),
});


Vue.component('events', {
    ready: function(){
        APP.filterEvents();
    },
    template: require("./events.html"),
});

Vue.component('event-detail', {
    template: require("./event-detail.html"),
});



Vue.component('event-detail-featured', {
    template: require("./event-detail-featured.html"),
});

Vue.component('featured', {
    ready: function(){
        APP.filterEvents('featured-event') ;
    },
    template: require("./featured.html"),
});

Vue.component('tallslide', {
    template: require("./tallslide.html"),
});


 Vue.component('livenow', {
    template: require("./livenow.html"),
});


Vue.component('about', {
    template: require("./about.html"),
});


Vue.component('map', {
    template: require("./map.html"),
});


Vue.component('rentals', {
    template: require("./rentals.html"),
});


Vue.component('sponsors', {
    template: require("./sponsors.html"),
});




