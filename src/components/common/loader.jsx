'use strict';

var React = require('react');


var Loader = React.createClass({
    propTypes: {
        mini: React.PropTypes.bool
    },

    render: function() {
        var loaderClass = this.props.mini ? 'loader loader--mini' : 'loader loader--large';
        return <div className={ loaderClass } />;
    }
});

module.exports = Loader;
