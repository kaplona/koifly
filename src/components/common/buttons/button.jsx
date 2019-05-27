'use strict';

import React from 'react';
import { bool, func, oneOf, string } from 'prop-types';

require('./button.less');


export default class Button extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    if (this.props.onClick && this.props.isEnabled) {
      this.props.onClick(event);
    }
  }

  render() {
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
}


Button.defaultProps = {
  fitContent: false,
  isAllScreens: false,
  isEnabled: true,
  isMobile: false,
  isSmall: false,
  type: 'button'
};

Button.propTypes = {
  buttonStyle: oneOf(['primary', 'secondary', 'warning']),
  caption: string.isRequired,
  fitContent: bool,
  isAllScreens: bool,
  isEnabled: bool,
  isMobile: bool,
  isSmall: bool,
  type: oneOf(['button', 'submit']),
  onClick: func.isRequired
};
