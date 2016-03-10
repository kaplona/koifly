'use strict';

var React = require('react');

if (process.env.BROWSER) {
    require('./feature-column.less');
}


var FeatureCulumn = React.createClass({

    propTypes: {
        float: React.PropTypes.oneOf(['left', 'right'])
    },

    render: function() {
        var className = 'feature-column';
        if (this.props.float) {
            className += ' x-' + this.props.float + '-float';
        }

        return (
            <div className={ className }>
                { this.props.children }
            </div>
        );
    }
});


module.exports = FeatureCulumn;
