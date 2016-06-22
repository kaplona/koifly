'use strict';

var React = require('react');

var DomUtil = require('../../../utils/dom-util');

require('./notice.less');


var Notice = React.createClass({
    propTypes: {
        text: React.PropTypes.string.isRequired,
        type: React.PropTypes.string,
        onClick: React.PropTypes.func, // if not provided button won't be rendered no matter if buttonText or isButtonEnabled present
        buttonText: React.PropTypes.string,
        isButtonEnabled: React.PropTypes.bool.isRequired,
        onClose: React.PropTypes.func // if not provided close-button won't be rendered
    },

    getDefaultProps: function() {
        return {
            isButtonEnabled: true
        };
    },

    componentDidMount: function() {
        DomUtil.scrollToTheTop();
    },

    componentDidUpdate: function() {
        DomUtil.scrollToTheTop();
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
                    disabled={ !this.props.isButtonEnabled }
                    onClick={ this.handleClick }
                    />
            );
        }
    },

    renderCloseButton: function() {
        if (this.props.onClose) {
            return (
                <div
                    className='close'
                    onClick={ this.handleClose }
                    onTouchStart={ () => {} } // required for iOS webkit browser to trigger :active pseudo state
                    >
                    x
                </div>
            );
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
