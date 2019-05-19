'use strict';

const React = require('react');
const {element, number, oneOfType, string} = React.PropTypes;
const Label = require('./label');
const ValueContainer = require('./value-container');


const RowContent = React.createClass({
  propTypes: {
    label: string,
    value: oneOfType([element, string, number])
  },

  render() {
    return (
      <div>
        <Label>{this.props.label}</Label>
        <ValueContainer>{this.props.value}</ValueContainer>
      </div>
    );
  }
});


module.exports = RowContent;
