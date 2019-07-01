import React from 'react';
import { arrayOf, bool, func, number, oneOfType, shape, string } from 'prop-types';
import _ from 'lodash';

require('./dropdown.less');


export default class Dropdown extends React.Component {
  constructor() {
    super();
    this.emptyValue = '__EMPTY__';
    this.handleUserInput = this.handleUserInput.bind(this);
  }

  handleUserInput(e) {
    let value = e.target.value;
    if (value === this.emptyValue) {
      value = null;
    }
    this.props.onChangeFunc(this.props.inputName, value);
  }

  render() {
    // Sort options in ascending order if needed
    let sortedOptions = this.props.options;
    if (!this.props.noSort) {
      sortedOptions = _.sortBy(this.props.options, option => {
        return option.text.toString().toUpperCase();
      });
    }

    // Add an empty value to options list if needed
    if (this.props.emptyValue !== undefined || this.props.emptyText !== undefined) {
      sortedOptions.unshift({
        value: this.props.emptyValue || this.emptyValue,
        text: (this.props.emptyText !== undefined) ? this.props.emptyText : ''
      });
    }

    return (
      <div className='dropdown'>
        <select
          className={this.props.className || null}
          value={this.props.selectedValue || this.props.emptyValue || this.emptyValue}
          disabled={!this.props.isEnabled}
          onChange={this.handleUserInput}
          onFocus={this.props.onFocus}
          onBlur={this.props.onBlur}
        >
          {sortedOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      </div>
    );
  }
}


Dropdown.defaultProps = {
  isEnabled: true,
  noSort: false
};

Dropdown.propTypes = {
  selectedValue: oneOfType([string, number]),
  options: arrayOf(shape({
    value: oneOfType([string, number]),
    text: oneOfType([string, number])
  })).isRequired,
  inputName: oneOfType([string, number]),
  emptyText: oneOfType([string, number]),
  emptyValue: oneOfType([string, number]),
  className: string,
  isEnabled: bool,
  noSort: bool,
  onChangeFunc: func.isRequired,
  onFocus: func,
  onBlur: func
};
