'use strict';

const React = require('react');

require('./description.less');


const Description = React.createClass({
    render() {
        return (
            <div className='description'>
                {this.props.children}
            </div>
        );
    }
});


module.exports = Description;
