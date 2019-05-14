'use strict';

const React = require('react');

require('./description.less');


function Description(props) {
    return (
        <div className='description'>
            {props.children}
        </div>
    );
}


module.exports = Description;
