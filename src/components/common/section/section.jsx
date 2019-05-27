'use strict';

import React from 'react';
import { bool, func } from 'prop-types';
import Button from '../buttons/button';

require('./section.less');


// defined as class for testing purposes
export default class Section extends React.Component {
  render() {
    let className = 'section';
    if (this.props.isFullScreen) {
      className += ' x-full-screen';
    }

    return (
      <div className={className}>
        {this.props.children}
        {this.props.onEditClick && (
          <div className='edit-button'>
            <Button caption='Edit' onClick={this.props.onEditClick}/>
          </div>
        )}
      </div>
    );
  }
}


Section.defaultProps = {
  isFullScreen: false
};

Section.propTypes = {
  isFullScreen: bool,
  onEditClick: func
};
