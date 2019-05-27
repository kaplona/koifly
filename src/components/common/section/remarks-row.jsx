'use strict';

import React from 'react';
import { string } from 'prop-types';
import Label from './label';

require('./remarks-row.less');


// defined as class for testing purposes
export default class RemarksRow extends React.Component {
  render() {
    if (!this.props.value) {
      return null;
    }

    const newLines = this.props.value.split('\n');
    const remarks = newLines.map((newLine, index) => {
      return <span key={'remark-' + index}>{newLine}<br/></span>;
    });

    return (
      <div className='remarks-row'>
        <Label>Remarks:</Label>
        <div className='remarks'>{remarks}</div>
      </div>
    );
  }
}

RemarksRow.propTypes = {
  value: string.isRequired // can be an empty string
};
