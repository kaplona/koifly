'use strict';

import React from 'react';
import { bool, func, string } from 'prop-types';

require('./mobile-top-menu.less');


// defined as class for testing purposes
export default class MobileTopMenu extends React.Component {
  render() {
    let className = 'mobile-top-menu';
    // Virtual keyboard breaks fixed position of the menu
    // thus we leave position: static if any input is focused
    // original solution: https://dansajin.com/2012/12/07/fix-position-fixed/
    if (!this.props.isPositionFixed) {
      className += ' x-static';
    }

    return (
      <div className={className}>
        <div
          className='top-navigation'
          onClick={this.props.onLeftClick}
          onTouchStart={() => {}} // required for iOS webkit browser to trigger :active pseudo state
        >
          {this.props.leftButtonCaption}
        </div>
        <div className='header'>
          {this.props.header}
        </div>
        <div
          className='top-navigation'
          onClick={this.props.onRightClick}
          onTouchStart={() => {}} // required for iOS webkit browser to trigger :active pseudo state
        >
          {this.props.rightButtonCaption}
        </div>
      </div>
    );
  }
}


MobileTopMenu.defaultProps = {
  isPositionFixed: true
};

MobileTopMenu.propTypes = {
  header: string,
  leftButtonCaption: string,
  rightButtonCaption: string,
  onLeftClick: func,
  onRightClick: func,
  isPositionFixed: bool
};
