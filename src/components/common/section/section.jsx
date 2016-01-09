'use strict';

var React = require('react');

require('./section.less');


var Section = React.createClass({
    render: function() {
        return (
            <div className='section'>
                { this.props.children }
            </div>
        );
    }
});


module.exports = Section;
