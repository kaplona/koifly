'use strict';

var React = require('react');

if (process.env.BROWSER) {
    require('./signup-button.less');
}


var SignupButton = React.createClass({

    propTypes: {
        caption: React.PropTypes.string.isRequired
    },

    getDefaultProps: function() {
        return {
            caption: 'Sign up'
        };
    },

    render: function() {
        return (
            <a href='/signup' className='signup-button'>
               { this.props.caption }
            </a>
        );
    }
});


module.exports = SignupButton;
