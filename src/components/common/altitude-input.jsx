'use strict';

var React = require('react');
var Altitude = require('../../utils/altitude');
var DropDown = require('./dropdown');


var AltitudeInput = React.createClass({

    propTypes: {
        inputValue: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        selectedAltitudeUnits: React.PropTypes.string,
        fieldName: React.PropTypes.string,
        labelText: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.element
        ]),
        errorMessage: React.PropTypes.string,
        onChange: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            fieldName: 'altitude'
        };
    },

    handleUserInput: function(inputName, inputValue) {
        if (inputValue === undefined) {
            inputValue = this.refs[inputName].getDOMNode().value;
        }
        this.props.onChange(inputName, inputValue);
    },

    render: function() {
        var altitudeUnitsList = Altitude.getAltitudeUnitsValueTextList();

        return (
            <div>
                <div className='error_message'>
                    { this.props.errorMessage }
                </div>
                <label>{ this.props.labelText }</label>
                <input
                    value={ this.props.inputValue }
                    type='text'
                    className={ this.props.errorMessage !== null ? 'error' : '' }
                    onChange={ this.handleUserInput.bind(this, this.props.fieldName) }
                    ref={ this.props.fieldName }
                    />
                <div className='inline'>
                    <DropDown
                        selectedValue={ this.props.selectedAltitudeUnits }
                        options={ altitudeUnitsList }
                        inputName='altitudeUnits'
                        onChangeFunc={ this.handleUserInput }
                        errorMessage={ null }
                        />
                </div>
            </div>
        );
    }
});


module.exports = AltitudeInput;
