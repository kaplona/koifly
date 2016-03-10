'use strict';

var React = require('react');

if (process.env.BROWSER) {
    require('./signup-button.less');
}


var SignupButton = React.createClass({

    propTypes: {
        capture: React.PropTypes.string.isRequired
    },

    getDefaultProps: function() {
        return {
            capture: 'Sign up'
        };
    },

    render: function() {
        return (
            <a href='/signup' className='signup-button'>
               { this.props.capture }
            </a>
        );
    }
});


module.exports = SignupButton;
