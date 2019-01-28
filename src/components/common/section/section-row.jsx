'use strict';

const React = require('react');
const {bool} = React.PropTypes;

require('./section-row.less');


const SectionRow = React.createClass({

    propTypes: {
        isDesktopOnly: bool,
        isLast: bool,
        isMobileLast: bool,
    },

    getDefaultProps: function() {
        return {
            isDesktopOnly: false,
            isLast: false,
            isMobileLast: false,
        };
    },

    render: function() {
        let className = 'section-row';
        if (this.props.isLast) {
            className += ' x-last';
        }
        if (this.props.isMobileLast) {
            className += ' x-mobile-last';
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
