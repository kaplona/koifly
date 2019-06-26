'use strict';

import React from 'react';
import Header from './common/menu/header';

require('./koifly.less');


// defined as class for testing purposes
export default class Koifly extends React.Component {
  render() {
    return (
      <div className='content'>
        <Header/>
        {this.props.children}
      </div>
    );
  }
}
