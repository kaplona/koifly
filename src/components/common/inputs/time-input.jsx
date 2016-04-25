'use strict';

var React = require('react');
var Label = require('../section/label');
var InputContainer = require('./input-container');
var ValidationError = require('../section/validation-error');

require('./four-input-elements.less');


var TimeInput = React.createClass({

    propTypes: {
        hours: React.PropTypes.string.isRequired,
        minutes: React.PropTypes.string.isRequired,
        labelText: React.PropTypes.string,
        errorMessage: React.PropTypes.string,
        onChange: React.PropTypes.func.isRequired
    },

    handleUserInput: function(inputName) {
        this.props.onChange(inputName, this.refs[inputName].getDOMNode().value);
    },

    renderErrorMessage: function() {
        if (this.props.errorMessage) {
            return <ValidationError message={ this.props.errorMessage } />;
        }
    },

    render: function() {
        var inputClassName = 'col-of-four input x-number';
        if (this.props.errorMessage) {
            inputClassName += ' x-error';
        }

        return (
            <div>
                { this.renderErrorMessage() }

                <Label>
                    { this.props.labelText }
                </Label>

                <InputContainer>
                    <input
                        className={ inputClassName }
                        value={ this.props.hours }
                        type='text'
                        pattern='[0-9]*'
                        placeholder='0'
                        onChange={ () => this.handleUserInput('hours') }
                        ref='hours'
                        />
                    <div className='mobile col-of-four'>h</div>
                    <div className='desktop col-of-four'>hours</div>
                    <input
                        className={ inputClassName }
                        value={ this.props.minutes }
                        type='text'
                        pattern='[0-9]*'
                        placeholder='0'
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
