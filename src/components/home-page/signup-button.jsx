'use strict';

var React = require('react');

if (process.env.BROWSER) {
    require('./signup-button.less');
}


var SignupButton = React.createClass({

    propTypes: {
        text: React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            text: 'Sign up'
        };
    },

    render: function() {
        return (
            <a href='/signup' className='signup-button'>
               { this.props.text }
            </a>
        );
    }
});


module.exports = SignupButton;
