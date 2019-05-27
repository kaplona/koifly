'use strict';

import React from 'react';
import { string } from 'prop-types';

require('./validation-error.less');


// defined as class for testing purposes
export default class ValidationError extends React.Component {
  render() {
    return (
      <div className='validation-error'>
        {this.props.message}
      </div>
    );
  }
}


ValidationError.propTypes = {
  message: string.isRequired
};
