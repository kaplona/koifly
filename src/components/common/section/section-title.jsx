'use strict';

var React = require('react');

require('./section-title.less');


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
