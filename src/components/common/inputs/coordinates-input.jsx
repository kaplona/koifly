'use strict';

import React from 'react';
import { element, func, oneOfType, string } from 'prop-types';
import AppLink from '../app-link';
import InputContainer from './input-container';
import Label from '../section/label';
import ValidationError from '../section/validation-error';

require('./after-comment.less');


export default class TextInput extends React.Component {
  constructor() {
    super();
    this.handleUserInput = this.handleUserInput.bind(this);
  }

  handleUserInput(e) {
    this.props.onChange(this.props.inputName, e.target.value);
  }

  render() {
    let className = 'x-text';
    if (this.props.errorMessage) {
      className += ' x-error';
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
            className={className}
            value={this.props.inputValue}
            type='text'
            placeholder='ex: 49.281082 -123.120888'
            onChange={this.handleUserInput}
            onFocus={this.props.onFocus}
            onBlur={this.props.onBlur}
          />

          <div className='after-comment'>
            <AppLink onClick={this.props.onMapShow}>or use a map</AppLink>
          </div>

        </InputContainer>
      </div>
    );
  }
}


TextInput.defaultProps = {
  inputName: 'coordinates'
};

TextInput.propTypes = {
  inputValue: string.isRequired,
  labelText: oneOfType([
    string,
    element
  ]),
  inputName: string,
  errorMessage: string,
  onChange: func.isRequired,
  onMapShow: func.isRequired,
  onFocus: func,
  onBlur: func
};
