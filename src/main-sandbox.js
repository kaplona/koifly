'use strict';

var React = require('react');
var BottomMenu = require('./components/common/menu/bottom-menu');
//var TopMenu = require('./components/common/menu/top-menu');


if (process.env.NODE_ENV !== 'development') {
    throw new Error('ERROR: Sandbox is only intended for dev environment');
}

require('./main-sandbox.less');


function mainSandbox() {
    React.render(
        React.createElement(BottomMenu, { isSiteView: true }),
        //React.createElement(TopMenu, { headerText: 'Koifly', leftText: 'Back', rightText: 'Edit' }),
        document.getElementById('container')
    );
}

document.addEventListener('DOMContentLoaded', mainSandbox);
