import React from 'react';
import { element, number, oneOfType, string } from 'prop-types';
import Label from './label';
import ValueContainer from './value-container';


// defined as class for testing purposes
export default class RowContent extends React.Component {
  render() {
    return (
      <div>
        <Label>{this.props.label}</Label>
        <ValueContainer>{this.props.value}</ValueContainer>
      </div>
    );
  }
}


RowContent.propTypes = {
  label: string,
  value: oneOfType([element, string, number])
};
