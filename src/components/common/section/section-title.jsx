'use strict';

var React = require('react');

require('./section-title.less');


var SectionTitle = React.createClass({

    propTypes: {
        isSubtitle: React.PropTypes.bool
    },

    render: function() {
        var className = 'section-title';
        if (this.props.isSubtitle) {
            className += ' x-subtitle';
        }

        return (
            <div className={ className }>
                { this.props.children }
            </div>
        );
    }
});


module.exports = SectionTitle;
