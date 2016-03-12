'use strict';

var React = require('react');

var NavigationMenu = require('./components/common/menu/navigation-menu');


if (process.env.NODE_ENV !== 'development') {
    throw new Error('ERROR: Sandbox is only intended for dev environment');
}

require('./main-sandbox.less');


function mainSandbox() {
    React.render(
        React.createElement(NavigationMenu, { isSiteView: true }),
        document.getElementById('container')
    );
}

document.addEventListener('DOMContentLoaded', mainSandbox);
