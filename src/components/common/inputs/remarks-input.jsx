import React from 'react';
import { func, string } from 'prop-types';
import Label from '../section/label';
import ValidationError from '../section/validation-error';

require('./remarks.less');


export default class RemarksInput extends React.Component {
  constructor() {
    super();
    this.handleUserInput = this.handleUserInput.bind(this);
  }

  handleUserInput(e) {
    this.props.onChange(this.props.inputName, e.target.value);
  }

  render() {
    return (
      <div>
        {!!this.props.errorMessage && (
          <ValidationError message={this.props.errorMessage}/>
        )}

        <Label>
          {this.props.labelText}
        </Label>

        <textarea
          className={this.props.errorMessage ? 'x-error' : null}
          value={this.props.inputValue}
          onChange={this.handleUserInput}
          onFocus={this.props.onFocus}
          onBlur={this.props.onBlur}
        />
      </div>
    );
  }
}


RemarksInput.defaultProps = {
  inputName: 'remarks'
};

RemarksInput.propTypes = {
  inputValue: string.isRequired,
  labelText: string,
  inputName: string,
  errorMessage: string,
  onChange: func.isRequired,
  onFocus: func,
  onBlur: func
};
