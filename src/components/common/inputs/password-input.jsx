'use strict';

var React = require('react');
var Label = require('./../section/label');
var Value = require('./../section/value-input');
var ValidationError = require('../section/validation-error');


var PasswordInput = React.createClass({

    propTypes: {
        inputValue: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        labelText: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.element
        ]),
        inputName: React.PropTypes.string,
        errorMessage: React.PropTypes.string,
        onChange: React.PropTypes.func
    },

    handleUserInput: function() {
        this.props.onChange(this.props.inputName, this.refs.input.getDOMNode().value);
    },

    renderErrorMessage: function() {
        if (this.props.errorMessage) {
            return <ValidationError text={ this.props.errorMessage } />;
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

                <Value>
                    <input
                        className={ className }
                        value={ this.props.inputValue }
                        type='password'
                        onChange={ this.handleUserInput }
                        ref='input'
                        />
                </Value>
            </div>
        );
    }
});


module.exports = PasswordInput;
