'use strict';

import React from 'react';
import { bool, element, func, number, oneOfType, string } from 'prop-types';
import Altitude from '../../../utils/altitude';
import Label from '../section/label';
import InputContainer from './input-container';
import Dropdown from './dropdown';
import ValidationError from '../section/validation-error';

require('./two-input-elements.less');
require('./after-comment.less');


export default class AltitudeInput extends React.Component {
  constructor() {
    super();
    this.handleAltitudeChange = this.handleAltitudeChange.bind(this);
    this.handleUnitChange = this.handleUnitChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
  }

  handleAltitudeChange(e) {
    this.props.onChange(this.props.inputName, e.target.value);
  }

  handleUnitChange(inputName, inputValue) {
    this.props.onChange(inputName, inputValue);
  }

  handleCheckboxChange() {
    this.props.onSledRide(!this.props.isSledRide);
  }

  renderSledRideCheckbox() {
    if (this.props.onSledRide) {
      return (
        <div className='after-comment'>
          <input
            id='sled-ride'
            type='checkbox'
            checked={this.props.isSledRide}
            onChange={this.handleCheckboxChange}
          />
          <label htmlFor='sled-ride'>was a sled ride :(</label>
        </div>
      );
    }
  }

  render() {
    const altitudeUnitsList = Altitude.getAltitudeUnitsValueTextList();

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
            className={'col-of-two x-number' + (this.props.errorMessage ? ' x-error' : '')}
            value={this.props.inputValue || ''}
            type='text'
            pattern='[0-9]*'
            placeholder='0'
            disabled={this.props.isSledRide}
            onChange={this.handleAltitudeChange}
            onFocus={this.props.onFocus}
            onBlur={this.props.onBlur}
          />

          <div className='col-of-two'>
            <Dropdown
              selectedValue={this.props.selectedAltitudeUnit}
              options={altitudeUnitsList}
              inputName='altitudeUnit'
              isEnabled={!this.props.isSledRide}
              onChangeFunc={this.handleUnitChange}
              onFocus={this.props.onFocus}
              onBlur={this.props.onBlur}
            />
          </div>

          {this.renderSledRideCheckbox()}
        </InputContainer>
      </div>
    );
  }
}


AltitudeInput.defaultProps = {
  inputName: 'altitude'
};

AltitudeInput.propTypes = {
  inputValue: oneOfType([number, string]).isRequired,
  selectedAltitudeUnit: string,
  inputName: string.isRequired,
  labelText: oneOfType([string, element]),
  errorMessage: string,
  onChange: func.isRequired,
  onFocus: func,
  onBlur: func,
  onSledRide: func,
  isSledRide: bool
};
