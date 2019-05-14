'use strict';

const React = require('react');
const { string } = React.PropTypes;

if (process.env.BROWSER) {
    require('./signup-button.less');
}


const SignupButton = React.createClass({

    propTypes: {
        caption: string.isRequired
    },

    getDefaultProps: function() {
        return {
            caption: 'Sign up'
        };
    },

    render: function() {
        return (
            <a href='/signup' className='signup-button'>
               {this.props.caption}
            </a>
        );
    }
});


module.exports = SignupButton;
