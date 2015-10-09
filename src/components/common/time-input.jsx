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
        errorMessageHours: React.PropTypes.string,
        errorMessageMinutes: React.PropTypes.string,
        onChange: React.PropTypes.func
    },

    handleUserInput: function(inputName) {
        this.props.onChange(inputName, this.refs[inputName].getDOMNode().value);
    },

    render: function() {
        return (
            <div>
                <div className='error_message'>
                    { this.props.errorMessageHours + ' ' + this.props.errorMessageMinutes }
                </div>
                <label>{ this.props.labelText }</label>
                <input
                    value={ this.props.hours }
                    type='text'
                    className={ this.props.errorMessageHours !== '' ? 'error' : '' }
                    onChange={ this.handleUserInput.bind(this, 'hours') }
                    ref='hours'
                    />
                <span>h</span>
                <input
                    value={ this.props.minutes }
                    type='text'
                    className={ this.props.errorMessageMinutes !== '' ? 'error' : '' }
                    onChange={ this.handleUserInput.bind(this, 'minutes') }
                    ref='minutes'
                    />
                <span>min</span>
            </div>
        );
    }
});


module.exports = TimeInput;



