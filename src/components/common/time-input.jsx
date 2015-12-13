'use strict';

var React = require('react');


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
        if (this.props.errorMessageHours || this.props.errorMessageMinutes) {
            return (
                <div className='error_message'>
                    { this.props.errorMessage } { ' ' } { this.props.errorMessageHours } { ' ' } { this.props.errorMessageMinutes }
                </div>
            );
        }
    },

    render: function() {
        return (
            <div>
                { this.renderErrorMessage() }
                <label>{ this.props.labelText }</label>
                <input
                    value={ this.props.hours }
                    type='text'
                    className={ (this.props.errorMessageHours) ? 'error' : '' }
                    onChange={ () => this.handleUserInput('hours') }
                    ref='hours'
                    />
                <span>h</span>
                <input
                    value={ this.props.minutes }
                    type='text'
                    className={ (this.props.errorMessageMinutes) ? 'error' : '' }
                    onChange={ () => this.handleUserInput('minutes') }
                    ref='minutes'
                    />
                <span>min</span>
            </div>
        );
    }
});


module.exports = TimeInput;
