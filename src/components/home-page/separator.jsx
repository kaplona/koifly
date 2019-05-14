'use strict';

const React = require('react');

if (process.env.BROWSER) {
    require('./separator.less');
}


function Separator() {
    return <div className='separator' />;
}


module.exports = Separator;
