var Hammer = require('hammerjs');
var IScroll = require('iscroll');


function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

if(inIframe()){
    // get touch events from tuio over ws
    window.client = new Caress.Client({
        host: '192.168.1.111',
        port: 5000
    });
    client.connect();
}



exports.install = function (Vue) {


    Vue.directive('touch', {
        isFn: true,

        bind: function () {
            if (!this.el.hammer) {
                this.el.hammer = Hammer(this.el)
            }
        },

        update: function (fn) {
            var vm = this.vm
            this.handler = function (e) {
                e.targetVM = vm
                fn.call(vm, e)
            }
            this.el.hammer.on(this.arg, this.handler)
        },

        unbind: function () {
            this.el.hammer.off(this.arg, this.handler)
            if (! this.el.hammer._eventHandler || !this.el.hammer._eventHandler.length) {
                this.el.hammer = null
            }
        }
    });



}
