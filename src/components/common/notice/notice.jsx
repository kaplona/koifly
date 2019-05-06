'use strict';

const React = require('react');
const { bool, element, func, oneOfType, string } = React.PropTypes;
const DomUtil = require('../../../utils/dom-util');

require('./notice.less');


const Notice = React.createClass({
    propTypes: {
        buttonText: string,
        isButtonEnabled: bool,
        isPadded: bool, // adds margin around notice, use it for rendering Notice on the top of content container
        text: oneOfType([element, string]).isRequired,
        type: string,
        onClick: func, // if not provided button won't be rendered no matter if buttonText or isButtonEnabled present
        onClose: func // if not provided close-button won't be rendered
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
        let className = 'notice';
        if (this.props.type) {
            className += ' x-' + this.props.type;
        }

        return (
            <div className={this.props.isPadded ? 'notice__padded-container' : ''}>
                <div className={ className }>
                    { this.props.text }
                    { this.renderButton() }
                    { this.renderCloseButton() }
                </div>
            </div>
        );
    }
});

module.exports = Notice;
