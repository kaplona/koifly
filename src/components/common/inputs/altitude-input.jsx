'use strict';

var React = require('react');
var Altitude = require('../../../utils/altitude');
var Label = require('../section/label');
var InputContainer = require('./input-container');
var Dropdown = require('./dropdown');
var ValidationError = require('../section/validation-error');

require('./two-input-elements.less');
require('./after-comment.less');


var { bool, element, func, oneOfType, string } = React.PropTypes;

var AltitudeInput = React.createClass({

    propTypes: {
        inputValue: string.isRequired,
        selectedAltitudeUnit: string,
        inputName: string.isRequired,
        labelText: oneOfType([string, element]),
        errorMessage: string,
        onChange: func.isRequired,
        onFocus: func,
        onBlur: func,
        onSledRide: func,
        isSledRide: bool
    },

    getDefaultProps: function() {
        return {
            inputName: 'altitude'
        };
    },

    handleUserInput: function(inputName, inputValue) {
        // When function is triggered from embedded component
        // both parameters are provided
        // otherwise retrieve input value from the DOM
        if (inputValue === undefined) {
            inputValue = this.refs[inputName].value;
        }

        this.props.onChange(inputName, inputValue);
    },

    handleCheckboxChange: function() {
        this.props.onSledRide(!this.props.isSledRide);
    },

    renderErrorMessage: function() {
        if (this.props.errorMessage) {
            return <ValidationError message={ this.props.errorMessage } />;
        }
    },

    renderSledRideCheckbox: function() {
        if (this.props.onSledRide) {
            return (
                <div className='after-comment'>
                    <input
                        type='checkbox'
                        checked={ this.props.isSledRide }
                        onChange={ this.handleCheckboxChange }
                        />
                    was a sled ride :(
                </div>
            );
        }
    },

    render: function() {
        var altitudeUnitsList = Altitude.getAltitudeUnitsValueTextList();

        return (
            <div>
                { this.renderErrorMessage() }

                <Label>
                    { this.props.labelText }
                </Label>

                <InputContainer>

                    <input
                        className={ 'col-of-two x-number' + (this.props.errorMessage ? ' x-error' : '') }
                        value={ this.props.inputValue }
                        type='text'
                        pattern='[0-9]*'
                        placeholder='0'
                        disabled={ this.props.isSledRide }
                        onChange={ () => this.handleUserInput(this.props.inputName) }
                        onFocus={ this.props.onFocus }
                        onBlur={ this.props.onBlur }
                        ref={ this.props.inputName }
                        />

                    <div className='col-of-two second'>
                        <Dropdown
                            selectedValue={ this.props.selectedAltitudeUnit }
                            options={ altitudeUnitsList }
                            inputName='altitudeUnit'
                            isEnabled={ !this.props.isSledRide }
                            onChangeFunc={ this.handleUserInput }
                            onFocus={ this.props.onFocus }
                            onBlur={ this.props.onBlur }
                            />
                    </div>

                    { this.renderSledRideCheckbox() }
                </InputContainer>
            </div>
        );
    }
});


module.exports = AltitudeInput;
