'use strict';

var React = require('react');
var PilotModel = require('../../models/pilot');


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

    handleUserInput: function(inputName) {
        this.props.onChange(inputName, this.refs[inputName].getDOMNode().value);
    },

    render: function() {
        var rawAltitudeUnitsList = PilotModel.getAltitudeUnitsList();
        var altitudeUnitOptions = rawAltitudeUnitsList.map(function(unitName) {
            return (
                <option
                    key={ unitName }
                    value={ unitName }
                >
                    { unitName }
                </option>
            );
        });

        return (
            <div>
                <div className='error_message'>
                    { this.props.errorMessage }
                </div>
                <label>{ this.props.labelText }</label>
                <input
                    value={ this.props.inputValue }
                    type='text'
                    className={ this.props.errorMessage !== '' ? 'error' : '' }
                    onChange={ this.handleUserInput.bind(this, this.props.fieldName) }
                    ref={ this.props.fieldName } />
                <select
                    value={ this.props.selectedAltitudeUnits }
                    onChange={ this.handleUserInput.bind(this, 'altitudeUnits') }
                    ref='altitudeUnits'
                >
                    { altitudeUnitOptions }
                </select>
            </div>
        );
    }
});


module.exports = AltitudeInput;



