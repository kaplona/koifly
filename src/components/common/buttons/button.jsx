'use strict';

var React = require('react');

require('./button.less');


var Button = React.createClass({

    propTypes: {
        caption: React.PropTypes.string.isRequired,
        type: React.PropTypes.oneOf(['button', 'submit']),
        buttonStyle: React.PropTypes.oneOf(['primary', 'secondary', 'warning']),
        onClick: React.PropTypes.func.isRequired,
        isEnabled: React.PropTypes.bool,
        isMobile: React.PropTypes.bool
    },

    getDefaultProps: function() {
        return {
            type: 'button',
            isEnabled: true,
            isMobile: false
        };
    },

    handleClick: function(event) {
        if (this.props.onClick && this.props.isEnabled) {
            this.props.onClick(event);
        }
    },

    render: function() {
        var className = this.props.isMobile ? 'mobile-button' : 'button';
        if (this.props.buttonStyle) {
            className += ' x-' + this.props.buttonStyle;
        }

        return (
            <input
                className={ className }
                type={ this.props.type }
                disabled={ !this.props.isEnabled }
                value={ this.props.caption }
                onClick={ this.handleClick }
                />
        );
    }
});


module.exports = Button;
