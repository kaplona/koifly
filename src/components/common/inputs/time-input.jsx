'use strict';

var React = require('react');
var Label = require('../section/label');
var InputContainer = require('./input-container');
var ValidationError = require('../section/validation-error');

require('./four-input-elements.less');


var { func, string } = React.PropTypes;

var TimeInput = React.createClass({

    propTypes: {
        hours: string.isRequired,
        minutes: string.isRequired,
        labelText: string,
        errorMessage: string,
        onChange: func.isRequired,
        onFocus: func,
        onBlur: func
    },

    handleUserInput: function(inputName) {
        this.props.onChange(inputName, this.refs[inputName].value);
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
                        onFocus={ this.props.onFocus }
                        onBlur={ this.props.onBlur }
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
                        onFocus={ this.props.onFocus }
                        onBlur={ this.props.onBlur }
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
