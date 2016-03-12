'use strict';

var React = require('react');

var InputContainer = require('./input-container');
var Label = require('../section/label');
var ValidationError = require('../section/validation-error');


var PasswordInput = React.createClass({

    propTypes: {
        inputValue: React.PropTypes.string.isRequired,
        labelText: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.element
        ]),
        inputName: React.PropTypes.string.isRequired,
        errorMessage: React.PropTypes.string,
        onChange: React.PropTypes.func.isRequired
    },

    handleUserInput: function() {
        this.props.onChange(this.props.inputName, this.refs.input.getDOMNode().value);
    },

    renderErrorMessage: function() {
        if (this.props.errorMessage) {
            return <ValidationError message={ this.props.errorMessage } />;
        }
    },

    render: function() {
        var className = 'x-text';
        if (this.props.errorMessage) {
            className += ' x-error';
        }

        return (
            <div>
                { this.renderErrorMessage() }

                <Label>
                    { this.props.labelText }
                </Label>

                <InputContainer>
                    <input
                        className={ className }
                        value={ this.props.inputValue }
                        type='password'
                        onChange={ this.handleUserInput }
                        ref='input'
                        />
                </InputContainer>
            </div>
        );
    }
});


module.exports = PasswordInput;
