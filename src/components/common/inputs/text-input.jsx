'use strict';

var React = require('react');
var Label = require('../section/label');
var Value = require('../section/value-input');
var ValidationError = require('../section/validation-error');


var TextInput = React.createClass({

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
        isNumber: React.PropTypes.bool,
        errorMessage: React.PropTypes.string,
        onChange: React.PropTypes.func,
        afterComment: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.element
        ])
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
        var className = this.props.isNumber ? 'x-number' : 'x-text';
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
                        type='text'
                        pattern={ this.props.isNumber ? '[0-9]*' : null }
                        onChange={ this.handleUserInput }
                        ref='input'
                        />
                    { this.props.afterComment }
                </Value>
            </div>
        );
    }
});


module.exports = TextInput;
