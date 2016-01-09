'use strict';

var React = require('react');

require('./notice.less');


var Notice = React.createClass({
    propTypes: {
        text: React.PropTypes.string.isRequired,
        type: React.PropTypes.string,
        onClick: React.PropTypes.func,
        buttonText: React.PropTypes.string,
        onClose: React.PropTypes.func
    },

    handleClick: function(event) {
        if (event) {
            event.preventDefault();
        }
        this.props.onClick();
    },

    handleClose: function(event) {
        if (event) {
            event.preventDefault();
        }
        this.props.onClose();
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

    renderCloseButton: function() {
        if (this.props.onClose) {
            return <a href='#' onClick={ this.handleClose }> Close</a>;
        }
    },

    render: function() {
        var className = 'notice';
        if (this.props.type) {
            className += ' x-' + this.props.type;
        }

        return (
            <div className={ className }>
                { this.props.text }
                { this.renderButton() }
                { this.renderCloseButton() }
            </div>
        );
    }
});

module.exports = Notice;
