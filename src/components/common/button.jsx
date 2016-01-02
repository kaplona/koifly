'use strict';

var React = require('react');


var Button = React.createClass({

    propTypes: {
        type: React.PropTypes.string,
        onClick: React.PropTypes.func,
        isEnabled: React.PropTypes.bool
    },

    getDefaultProps: function() {
        return {
            type: 'button',
            isEnabled: true
        };
    },

    handleClick: function(event) {
        if (this.props.onClick && this.props.isEnabled) {
            this.props.onClick(event);
        }
    },

    render: function() {
        return (
            <input
                className='button'
                type={ this.props.type }
                disabled={ !this.props.isEnabled ? 'disabled' : '' }
                value={ this.props.children }
                onClick={ this.handleClick }
                />
        );
    }
});


module.exports = Button;
