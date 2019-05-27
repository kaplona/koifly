'use strict';

import React from 'react';
import { bool, element, func, oneOfType, string } from 'prop-types';
import DomUtil from '../../../utils/dom-util';

require('./notice.less');


export default class Notice extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    DomUtil.scrollToTheTop();
  }

  componentDidUpdate() {
    DomUtil.scrollToTheTop();
  }

  handleClick(event) {
    if (event) {
      event.preventDefault();
    }
    this.props.onClick();
  }

  handleClose(event) {
    if (event) {
      event.preventDefault();
    }
    this.props.onClose();
  }

  render() {
    let className = 'notice';
    if (this.props.type) {
      className += ' x-' + this.props.type;
    }

    return (
      <div className={this.props.isPadded ? 'notice__padded-container' : ''}>
        <div className={className}>
          {this.props.text}

          {!!this.props.onClick && (
            <input
              type='button'
              value={this.props.buttonText}
              disabled={!this.props.isButtonEnabled}
              onClick={this.handleClick}
            />
          )}

          {!!this.props.onClose && (
            <div
              className='close'
              onClick={this.handleClose}
              onTouchStart={() => {}} // required for iOS webkit browser to trigger :active pseudo state
            >
              x
            </div>
          )}
        </div>
      </div>
    );
  }
}


Notice.defaultProps = {
  isButtonEnabled: true
};

Notice.propTypes = {
  buttonText: string,
  isButtonEnabled: bool,
  isPadded: bool, // adds margin around notice, use it for rendering Notice on the top of content container
  text: oneOfType([element, string]).isRequired,
  type: string,
  onClick: func, // if not provided button won't be rendered no matter if buttonText or isButtonEnabled present
  onClose: func // if not provided close-button won't be rendered
};
