'use strict';

const React = require('react');

require('./value-container.less');


function Value(props) {
    return (
        <div className='value-container'>
            {props.children}
        </div>
    );
}


module.exports = Value;
