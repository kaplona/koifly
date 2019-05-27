'use strict';

import React from 'react';

if (process.env.BROWSER) {
  require('./home-block.less');
}


// defined as class for testing purposes
export default class HomeBlock extends React.Component {
  render() {
    return (
      <div className='home-block'>
        {this.props.children}
      </div>
    );
  }
}
