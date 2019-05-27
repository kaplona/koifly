'use strict';

import React from 'react';
import { func, string } from 'prop-types';

require('./empty-list.less');


// defined as class for testing purposes
export default class EmptyList extends React.Component {
  render() {
    return (
      <div className='empty-list'>
        <div>{'You don\'t have any ' + this.props.ofWhichItems + ' yet'}</div>
        <div className='add-button' onClick={this.props.onAdding}>+</div>
      </div>
    );
  }
}


EmptyList.propTypes = {
  ofWhichItems: string.isRequired, // plural
  onAdding: func.isRequired
};
