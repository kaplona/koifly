'use strict';

var React = require('react');

require('./section-row.less');


var SectionRow = React.createClass({

    propTypes: {
        isLast: React.PropTypes.bool.isRequired,
        isDesktopOnly: React.PropTypes.bool.isRequired
    },

    getDefaultProps: function() {
        return {
            isLast: false,
            isDesktopOnly: false
        };
    },

    render: function() {
        var className = 'section-row';
        if (this.props.isLast) {
            className += ' x-last';
        }
        if (this.props.isDesktopOnly) {
            className += ' x-desktop';
        }

        return (
            <div className={ className }>
                { this.props.children }
            </div>
        );
    }
});


module.exports = SectionRow;
