'use strict';

var React = require('react');

require('./section-row.less');


var SectionRow = React.createClass({

    propTypes: {
        isLast: React.PropTypes.bool
    },

    render: function() {
        var className = this.props.isLast ? 'section-row x-last' : 'section-row';

        return (
            <div className={ className }>
                { this.props.children }
            </div>
        );
    }
});


module.exports = SectionRow;
