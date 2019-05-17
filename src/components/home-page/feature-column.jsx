'use strict';

const React = require('react');
const { oneOf } = React.PropTypes;

if (process.env.BROWSER) {
    require('./feature-column.less');
}

const FeatureColumn = React.createClass({
    propTypes: {
        float: oneOf(['left', 'right'])
    },

    render() {
        let className = 'feature-column';
        if (this.props.float) {
            className += ' x-' + this.props.float + '-float';
        }

        return (
            <div className={className}>
                {this.props.children}
            </div>
        );
    }
});


module.exports = FeatureColumn;
