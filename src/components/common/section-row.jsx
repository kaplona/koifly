'use strict';

var React = require('react');


var SectionRow = React.createClass({

    propTypes: {
        isSectionEnd: React.PropTypes.bool
    },

    render: function() {
        var className = this.props.isSectionEnd ? 'section-row end' : 'section-row';

        return (
            <div className={ className }>
                { this.props.children }
            </div>
        );
    }
});


module.exports = SectionRow;
