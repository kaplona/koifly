'use strict';

const React = require('react');

require('./compact-container.less');


const CompactContainer = React.createClass({
    render() {
        return (
            <div className='compact-container'>
                {this.props.children}
            </div>
        );
    }
});


module.exports = CompactContainer;
