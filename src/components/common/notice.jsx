'use strict';

var React = require('react');


var Notice = React.createClass({
    propTypes: {
        text: React.PropTypes.string.isRequired,
        type: React.PropTypes.string,
        onClick: React.PropTypes.func,
        buttonText: React.PropTypes.string
    },

    handleClick: function(event) {
        if (event) {
            event.preventDefault();
        }
        this.props.onClick();
    },

    renderButton: function() {
        if (this.props.onClick) {
            return (
                <a href='#' onClick={ this.handleClick }>
                    { this.props.buttonText }
                </a>
            );
        }
    },

    render: function() {
        var className = 'notice';
        if (this.props.type) {
            className += ' notice--' + this.props.type;
        }

        return (
            <div className={ className }>
                { this.props.text }
                { this.renderButton() }
            </div>
        );
    }
});

module.exports = Notice;
