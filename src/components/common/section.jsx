'use strict';

var React = require('react');


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
