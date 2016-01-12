'use strict';

var React = require('react');

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
            return (
                <div className='error_message'>
                    { this.props.errorMessage }
                </div>
            );
        }
    },

    renderLabel: function() {
        if (this.props.labelText) {
            return <label>{ this.props.labelText }</label>;
        }
    },

    render: function() {
        return (
            <div>
                { this.renderLabel() }
                { this.renderErrorMessage() }
                <textarea
                    value={ this.props.inputValue }
                    className={ (this.props.errorMessage) ? 'error' : '' }
                    onChange={ this.handleUserInput }
                    ref='textarea'
                    />
            </div>
        );
    }
});


module.exports = RemarksInput;
