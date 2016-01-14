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
                <input
                    type='button'
                    value={ this.props.buttonText }
                    onClick={ this.handleClick }
                    />
            );
        }
    },

    renderCloseButton: function() {
        if (this.props.onClose) {
            return <div className='close' onClick={ this.handleClose }>x</div>;
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
