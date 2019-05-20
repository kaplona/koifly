'use strict';

const React = require('react');
const { string } = React.PropTypes;
const _ = require('lodash');
const Label = require('./label');

require('./remarks-row.less');


const RemarksRow = React.createClass({
  propTypes: {
    value: string.isRequired // can be an empty string
  },

  render() {
    if (!this.props.value) {
      return null;
    }

    const newLines = this.props.value.split('\n');
    const remarks = _.map(newLines, (newLine, index) => {
      return <span key={'remark-' + index}>{newLine}<br/></span>;
    });

    return (
      <div className='remarks-row'>
        <Label>Remarks:</Label>
        <div className='remarks'>{remarks}</div>
      </div>
    );
  }
});


module.exports = RemarksRow;
