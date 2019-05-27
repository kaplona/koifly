'use strict';

import React from 'react';

require('./value-container.less');


// defined as class for testing purposes
export default class ValueContainer extends React.Component {
  render() {
    return (
      <div className='value-container'>
        {this.props.children}
      </div>
    );
  }
}
