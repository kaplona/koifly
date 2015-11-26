'use strict';

var React = require('react');


var Button = React.createClass({

    propTypes: {
        type: React.PropTypes.string,
        onClick: React.PropTypes.func,
        active: React.PropTypes.bool
    },

    getDefaultProps: function() {
        return {
            type: 'button',
            active: true
        };
    },

    handleClick: function() {
        if (this.props.onClick && this.props.active) {
            this.props.onClick();
        }
    },

    render: function() {
        return (
            <input
                className={ 'button' + (!this.props.active ? ' button--disabled' : '') }
                type={ this.props.type }
                value={ this.props.children }
                onClick={ this.handleClick }
                />
        );
    }
});


module.exports = Button;
