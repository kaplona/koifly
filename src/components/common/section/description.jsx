'use strict';

import React from 'react';

require('./description.less');


// defined as class for testing purposes
export default class Description extends React.Component {
  render() {
    return (
      <div className='description'>
        {this.props.children}
      </div>
    );
  }
}
