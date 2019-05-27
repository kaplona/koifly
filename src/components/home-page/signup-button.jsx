'use strict';

import React from 'react';
import { string } from 'prop-types';

if (process.env.BROWSER) {
  require('./signup-button.less');
}


// defined as class for testing purposes
export default class SignupButton extends React.Component {
  render() {
    return (
      <a href='/signup' className='signup-button'>
        {this.props.caption}
      </a>
    );
  }
}


SignupButton.defaultProps = {
  caption: 'Sign up'
};

SignupButton.propTypes = {
  caption: string.isRequired
};
