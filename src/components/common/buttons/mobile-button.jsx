'use strict';

var React = require('react');
var Button = require('./button');

require('./mobile-button.less');


var MobileButton = React.createClass({

    propTypes: {
        caption: React.PropTypes.string.isRequired,
        type: React.PropTypes.string,
        buttonStyle: React.PropTypes.string,
        onClick: React.PropTypes.func.isRequired,
        isEnabled: React.PropTypes.bool
    },

    render: function() {
        return <Button { ...this.props } isMobile={ true } />;
    }
});


module.exports = MobileButton;
