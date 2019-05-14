'use strict';

const React = require('react');

require('./compact-container.less');


function CompactContainer(props) {
    return (
        <div className='compact-container'>
            {props.children}
        </div>
    );
}


module.exports = CompactContainer;
