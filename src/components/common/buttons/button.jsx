'use strict';

var React = require('react');

require('./button.less');


var Button = React.createClass({

    propTypes: {
        text: React.PropTypes.string,
        type: React.PropTypes.string,
        className: React.PropTypes.string,
        buttonStyle: React.PropTypes.string,
        onClick: React.PropTypes.func,
        isEnabled: React.PropTypes.bool
    },

    getDefaultProps: function() {
        return {
            type: 'button',
            className: 'button',
            isEnabled: true
        };
    },

    handleClick: function(event) {
        if (this.props.onClick && this.props.isEnabled) {
            this.props.onClick(event);
        }
    },

    render: function() {
        var className = this.props.className;
        if (this.props.buttonStyle) {
            className += ' x-' + this.props.buttonStyle;
        }

        return (
            <input
                className={ className }
                type={ this.props.type }
                disabled={ !this.props.isEnabled ? 'disabled' : '' }
                value={ this.props.text }
                onClick={ this.handleClick }
                />
        );
    }
});


module.exports = Button;
