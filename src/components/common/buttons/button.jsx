'use strict';

const React = require('react');
const { bool, func, oneOf, string } = React.PropTypes;

require('./button.less');


const Button = React.createClass({

  propTypes: {
    buttonStyle: oneOf(['primary', 'secondary', 'warning']),
    caption: string.isRequired,
    fitContent: bool,
    isAllScreens: bool,
    isEnabled: bool,
    isMobile: bool,
    isSmall: bool,
    type: oneOf(['button', 'submit']),
    onClick: func.isRequired
  },

  getDefaultProps: function() {
    return {
      fitContent: false,
      isAllScreens: false,
      isEnabled: true,
      isMobile: false,
      isSmall: false,
      type: 'button'
    };
  },

  handleClick: function(event) {
    if (this.props.onClick && this.props.isEnabled) {
      this.props.onClick(event);
    }
  },

  render: function() {
    let className = this.props.isMobile ? 'mobile-button' : 'button';
    if (!this.props.isAllScreens && !this.props.isMobile) {
      className += ' desktop-only';
    }
    if (this.props.buttonStyle) {
      className += ` x-${this.props.buttonStyle}`;
    }
    if (this.props.fitContent) {
      className += ' x-content-width';
    }
    if (this.props.isSmall) {
      className += ' x-small';
    }

    return (
      <input
        className={className}
        type={this.props.type}
        disabled={!this.props.isEnabled}
        value={this.props.caption}
        onClick={this.handleClick}
      />
    );
  }
});


module.exports = Button;
