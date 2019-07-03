import React from 'react';
import { arrayOf, bool, func, number, oneOfType, shape, string } from 'prop-types';
import Label from '../section/label';
import InputContainer from './input-container';
import Dropdown from './dropdown';
import ValidationError from '../section/validation-error';


// defined as class for testing purposes
export default class DropdownInput extends React.Component {
  render() {
    return (
      <div>
        {!!this.props.errorMessage && (
          <ValidationError message={this.props.errorMessage}/>
        )}

        <Label>
          {this.props.labelText}
        </Label>

        <InputContainer>
          <Dropdown
            className={(this.props.errorMessage) ? 'x-error' : null}
            selectedValue={this.props.selectedValue}
            options={this.props.options}
            inputName={this.props.inputName}
            emptyText={this.props.emptyText}
            emptyValue={this.props.emptyValue}
            noSort={this.props.noSort}
            onChangeFunc={this.props.onChangeFunc}
            onFocus={this.props.onFocus}
            onBlur={this.props.onBlur}
          />
        </InputContainer>
      </div>
    );
  }
}


DropdownInput.propTypes = {
  selectedValue: oneOfType([string, number]),
  options: arrayOf(shape({
    value: oneOfType([string, number]),
    text: oneOfType([string, number])
  })).isRequired,
  labelText: string,
  inputName: string,
  emptyText: oneOfType([string, number]),
  emptyValue: oneOfType([string, number]),
  noSort: bool,
  errorMessage: string,
  onChangeFunc: func.isRequired,
  onFocus: func,
  onBlur: func
};
