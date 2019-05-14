'use strict';

const React = require('react');
const { bool } = React.PropTypes;

require('./section-title.less');


const SectionTitle = React.createClass({

    propTypes: {
        isDesktopOnly: bool,
        isSubtitle: bool
    },

    getDefaultProps: function() {
        return {
            isDesktopOnly: false,
            isSubtitle: false
        };
    },

    render: function() {
        let className = 'section-title';
        if (this.props.isSubtitle) {
            className += ' x-subtitle';
        }
        if (this.props.isDesktopOnly) {
            className += ' x-desktop';
        }

        return (
            <div className={className}>
                {this.props.children}
            </div>
        );
    }
});


module.exports = SectionTitle;
