'use strict';


var DomUtil = {

    maxWidth: 600, // medium viewport break point in css
    menuHeight: 42, // mobile menu height in css

    
    makeFullScreen: function(selector) {
        var vw = document.documentElement.clientWidth;
        var vh = document.documentElement.clientHeight;

        if (vw < this.maxWidth) {
            var element = document.querySelector(selector);
            element.style.height = `${vh - this.menuHeight * 2}px`;
        }
    },


    scrollToTheTop: function() {
        window.scrollTo(0, 0);
    }
};


module.exports = DomUtil;
