'use strict';

var React = require('react');


var RemarksInput = React.createClass({

    propTypes: {
        inputValue: React.PropTypes.string,
        labelText: React.PropTypes.string,
        errorMessage: React.PropTypes.string,
        onChange: React.PropTypes.func
    },

    handleUserInput: function() {
        this.props.onChange(this.refs.textarea.getDOMNode().value);
    },

    render: function() {
        return (
            <div>
                <label>{ this.props.labelText }</label>
                <div className='error_message'>
                    { this.props.errorMessage }
                </div>
                <textarea
                    value={ this.props.inputValue }
                    className={ this.props.errorMessage !== null ? 'error' : '' }
                    onChange={ this.handleUserInput }
                    ref='textarea'
                    />
            </div>
        );
    }
});


module.exports = RemarksInput;



