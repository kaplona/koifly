'use strict';

var React = require('react');


var SectionRow = React.createClass({

    propTypes: {
        isLast: React.PropTypes.bool
    },

    render: function() {
        var className = this.props.isLast ? 'section-row last' : 'section-row';

        return (
            <div className={ className }>
                { this.props.children }
            </div>
        );
    }
});


module.exports = SectionRow;
