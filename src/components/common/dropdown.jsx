'use strict';

var React = require('react');


var DropDown = React.createClass({

    propTypes: {
        selectedValue: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        options: React.PropTypes.arrayOf(React.PropTypes.shape({
            value: React.PropTypes.string,
            text: React.PropTypes.string
        })).isRequired,
        labelText: React.PropTypes.string,
        errorMessage: React.PropTypes.string,
        onChangeFunc: React.PropTypes.func
    },

    handleUserInput: function() {
        this.props.onChangeFunc(this.refs.selectInput.getDOMNode().value);
        return;
    },

    render: function() {
        var selectOptions = this.props.options.map(function(option) {
            return (
                <option
                    key={ option.value }
                    value={ option.value }
                >
                    { option.text }
                </option>
            );
        });

        return (
            <div>
                <div className='error_message'>
                    { this.props.errorMessage }
                </div>
                <label>{ this.props.labelText }</label>
                <select
                    className={ this.props.errorMessage !== '' ? 'error' : '' }
                    value={ this.props.selectedValue }
                    onChange={ this.handleUserInput }
                    ref='selectInput'
                >
                    { selectOptions }
                </select>
            </div>
        );
    }
});


module.exports = DropDown;



