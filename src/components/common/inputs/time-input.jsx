'use strict';

import React from 'react';
import { func, number, oneOfType, string } from 'prop-types';
import Label from '../section/label';
import InputContainer from './input-container';
import ValidationError from '../section/validation-error';

require('./four-input-elements.less');


export default class TimeInput extends React.Component {
  handleUserInput(e, inputName) {
    this.props.onChange(inputName, e.target.value);
  }

  render() {
    let inputClassName = 'col-of-four input x-number';
    if (this.props.errorMessage) {
      inputClassName += ' x-error';
    }

    return (
      <div>
        {!!this.props.errorMessage && (
          <ValidationError message={this.props.errorMessage}/>
        )}

        <Label>
          {this.props.labelText}
        </Label>

        <InputContainer>
          <input
            className={inputClassName}
            value={this.props.hours || ''}
            type='text'
            pattern='[0-9]*'
            placeholder='0'
            onChange={e => this.handleUserInput(e, 'hours')}
            onFocus={this.props.onFocus}
            onBlur={this.props.onBlur}
          />
          <div className='mobile col-of-four'>h</div>
          <div className='desktop col-of-four'>hours</div>
          <input
            className={inputClassName}
            value={this.props.minutes || ''}
            type='text'
            pattern='[0-9]*'
            placeholder='0'
            onChange={e => this.handleUserInput(e, 'minutes')}
            onFocus={this.props.onFocus}
            onBlur={this.props.onBlur}
          />
          <div className='mobile col-of-four'>min</div>
          <div className='desktop col-of-four'>minutes</div>
        </InputContainer>
      </div>
    );
  }
}


TimeInput.propTypes = {
  hours: oneOfType([number, string]),
  minutes: oneOfType([number, string]),
  labelText: string,
  errorMessage: string,
  onChange: func.isRequired,
  onFocus: func,
  onBlur: func
};
