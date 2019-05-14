'use strict';

const React = require('react');

require('./label.less');


function Label(props) {
    return (
        <div className='label'>
            {props.children}
        </div>
    );
}


module.exports = Label;
