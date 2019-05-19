'use strict';

const React = require('react');
const {arrayOf, bool, func, number, oneOfType, shape, string} = React.PropTypes;
const Label = require('../section/label');
const InputContainer = require('./input-container');
const Dropdown = require('./dropdown');
const ValidationError = require('../section/validation-error');


const DropdownInput = React.createClass({

  propTypes: {
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
  },

  renderErrorMessage: function () {
    if (this.props.errorMessage) {
      return <ValidationError message={this.props.errorMessage}/>;
    }
  },

  render: function () {
    return (
      <div>
        {this.renderErrorMessage()}

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
});


module.exports = DropdownInput;
