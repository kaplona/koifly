'use strict';

const React = require('react');
const { oneOf } = React.PropTypes;

if (process.env.BROWSER) {
    require('./feature-column.less');
}


function FeatureColumn(props) {
    let className = 'feature-column';
    if (props.float) {
        className += ' x-' + props.float + '-float';
    }

    return (
        <div className={className}>
            {props.children}
        </div>
    );
}

FeatureColumn.propTypes = {
    float: oneOf(['left', 'right'])
};


module.exports = FeatureColumn;
