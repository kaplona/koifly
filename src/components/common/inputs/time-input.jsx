'use strict';

var React = require('react');
var Label = require('../section/label');
var Value = require('../section/value-input');
var ValidationError = require('../section/validation-error');


var TimeInput = React.createClass({

    propTypes: {
        hours: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        minutes: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        labelText: React.PropTypes.string,
        errorMessage: React.PropTypes.string,
        errorMessageHours: React.PropTypes.string,
        errorMessageMinutes: React.PropTypes.string,
        onChange: React.PropTypes.func
    },

    handleUserInput: function(inputName) {
        this.props.onChange(inputName, this.refs[inputName].getDOMNode().value);
    },

    renderErrorMessage: function() {
        if (this.props.errorMessage || this.props.errorMessageHours || this.props.errorMessageMinutes) {
            var errorText = this.props.errorMessage || this.props.errorMessageHours || this.props.errorMessageMinutes;
            return <ValidationError text={ errorText } />;
        }
    },

    render: function() {
        return (
            <div>
                { this.renderErrorMessage() }

                <Label>
                    { this.props.labelText }
                </Label>

                <Value>
                    <input
                        className='col-of-four'
                        value={ this.props.hours }
                        type='text'
                        onChange={ () => this.handleUserInput('hours') }
                        ref='hours'
                        />
                    <div className='col-of-four'>h</div>
                    <input
                        className='col-of-four'
                        value={ this.props.minutes }
                        type='text'
                        onChange={ () => this.handleUserInput('minutes') }
                        ref='minutes'
                        />
                    <div className='col-of-four'>min</div>
                </Value>
            </div>
        );
    }
});


module.exports = TimeInput;
