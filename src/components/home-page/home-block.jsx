'use strict';

const React = require('react');

if (process.env.BROWSER) {
    require('./home-block.less');
}


function HomeBlock(props) {
    return (
        <div className='home-block'>
            {props.children}
        </div>
    );
}


module.exports = HomeBlock;
