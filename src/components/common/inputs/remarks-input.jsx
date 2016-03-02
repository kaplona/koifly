'use strict';

var React = require('react');
var Label = require('../section/label');
var ValidationError = require('../section/validation-error');

require('./remarks.less');


var RemarksInput = React.createClass({

    propTypes: {
        inputValue: React.PropTypes.string,
        labelText: React.PropTypes.string,
        inputName: React.PropTypes.string,
        errorMessage: React.PropTypes.string,
        onChange: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            inputName: 'remarks'
        };
    },

    handleUserInput: function() {
        this.props.onChange(this.props.inputName, this.refs.textarea.getDOMNode().value);
    },

    renderErrorMessage: function() {
        if (this.props.errorMessage) {
            return <ValidationError text={ this.props.errorMessage } />;
        }
    },

    render: function() {
        return (
            <div>
                { this.renderErrorMessage() }
                <Label>{ this.props.labelText }</Label>
                <textarea
                    className={ this.props.errorMessage ? 'x-error' : null }
                    value={ this.props.inputValue }
                    onChange={ this.handleUserInput }
                    ref='textarea'
                    />
            </div>
        );
    }
});


module.exports = RemarksInput;
