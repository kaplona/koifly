'use strict';

import React from 'react';

require('./label.less');


// defined as class for testing purposes
export default class Label extends React.Component {
  render() {
    return (
      <div className='label'>
        {this.props.children}
      </div>
    );
  }
}
