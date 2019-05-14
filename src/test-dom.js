'use strict';


module.exports = function(markup) {
    if (typeof document !== 'undefined') {
        return;
    }

    const jsdom = require('jsdom').jsdom;
    global.document = jsdom(markup || '<html><body></body></html>');
    global.window = document.defaultView;
    global.navigator = window.navigator;
    global.HTMLElement = window.HTMLElement;
    // Note: here we can add whatever browser globals the tests might need
};
