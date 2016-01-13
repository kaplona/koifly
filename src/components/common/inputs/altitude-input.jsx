'use strict';

var React = require('react');
var Altitude = require('../../../utils/altitude');
var Label = require('../section/label');
var Value = require('../section/value-input');
var Dropdown = require('./dropdown');
var ValidationError = require('../section/validation-error');


var AltitudeInput = React.createClass({

    propTypes: {
        inputValue: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        selectedAltitudeUnit: React.PropTypes.string,
        inputName: React.PropTypes.string,
        labelText: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.element
        ]),
        errorMessage: React.PropTypes.string,
        onChange: React.PropTypes.func
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
            inputValue = this.refs[inputName].getDOMNode().value;
        }

        this.props.onChange(inputName, inputValue);
    },

    renderErrorMessage: function() {
        if (this.props.errorMessage) {
            return <ValidationError text={ this.props.errorMessage } />;
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

                <Value>
                    <input
                        className='col-of-two'
                        value={ this.props.inputValue }
                        type='text'
                        onChange={ () => this.handleUserInput(this.props.inputName) }
                        ref={ this.props.inputName }
                        />
                    <div className='col-of-two'>
                        <Dropdown
                            selectedValue={ this.props.selectedAltitudeUnit }
                            options={ altitudeUnitsList }
                            inputName='altitudeUnit'
                            onChangeFunc={ this.handleUserInput }
                            />
                    </div>
                </Value>
            </div>
        );
    }
});


module.exports = AltitudeInput;
