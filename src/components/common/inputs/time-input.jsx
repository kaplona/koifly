'use strict';

var React = require('react');
var Label = require('../section/label');
var InputContainer = require('./input-container');
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
        var hoursErrorClass = '';
        var minutesErrorClass = '';
        if (this.props.errorMessage || this.props.errorMessageHours) {
            hoursErrorClass = ' x-error';
        }
        if (this.props.errorMessage || this.props.errorMessageMinutes) {
            minutesErrorClass = ' x-error';
        }

        return (
            <div>
                { this.renderErrorMessage() }

                <Label>
                    { this.props.labelText }
                </Label>

                <InputContainer>
                    <input
                        className={ 'col-of-four input x-number' + hoursErrorClass }
                        value={ this.props.hours }
                        type='text'
                        pattern='[0-9]*'
                        onChange={ () => this.handleUserInput('hours') }
                        ref='hours'
                        />
                    <div className='mobile col-of-four'>h</div>
                    <div className='desktop col-of-four'>hours</div>
                    <input
                        className={ 'col-of-four input x-number' + minutesErrorClass }
                        value={ this.props.minutes }
                        type='text'
                        pattern='[0-9]*'
                        onChange={ () => this.handleUserInput('minutes') }
                        ref='minutes'
                        />
                    <div className='mobile col-of-four'>min</div>
                    <div className='desktop col-of-four'>minutes</div>
                </InputContainer>
            </div>
        );
    }
});


module.exports = TimeInput;
