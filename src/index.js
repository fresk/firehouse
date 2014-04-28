var Vue = require('vue');
Vue.use(require('./lib/vue-tuio'));

require("./views")


window.APP = new Vue({
    el: '#app',
    data: {
        currentScreen: 'home'
    }
})












