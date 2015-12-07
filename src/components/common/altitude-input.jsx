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
            return (<div className='error_message'>
                { this.props.errorMessage }
            </div>);
        }
    },

    render: function() {
        var altitudeUnitsList = Altitude.getAltitudeUnitsValueTextList();

        return (
            <div>
                { this.renderErrorMessage() }
                <label>{ this.props.labelText }</label>
                <input
                    value={ this.props.inputValue }
                    type='text'
                    className={ (this.props.errorMessage !== null) ? 'error' : '' }
                    onChange={ () => this.handleUserInput(this.props.inputName) }
                    ref={ this.props.inputName }
                    />
                <div className='inline'>
                    <DropDown
                        selectedValue={ this.props.selectedAltitudeUnit }
                        options={ altitudeUnitsList }
                        inputName='altitudeUnit'
                        onChangeFunc={ this.handleUserInput }
                        />
                </div>
            </div>
        );
    }
});


module.exports = AltitudeInput;
