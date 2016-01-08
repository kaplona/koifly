'use strict';

var React = require('react');


var SectionTitle = React.createClass({
    render: function() {
        return (
            <div className='section-title'>
                { this.props.children }
            </div>
        );
    }
});


module.exports = SectionTitle;
