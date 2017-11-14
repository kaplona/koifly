'use strict';

var React = require('react');
var _ = require('lodash');

require('./dropdown.less');


var { arrayOf, bool, func, number, oneOfType, shape, string } = React.PropTypes;

var Dropdown = React.createClass({

    propTypes: {
        selectedValue: oneOfType([string, number]).isRequired,
        options: arrayOf(shape({
            value: string,
            text: string
        })).isRequired,
        inputName: oneOfType([string, number]).isRequired,
        emptyValue: oneOfType([string, number]),
        className: string,
        isEnabled: bool.isRequired,
        onChangeFunc: func.isRequired,
        onFocus: func,
        onBlur: func
    },

    getDefaultProps: function() {
        return {
            isEnabled: true
        };
    },

    handleUserInput: function() {
        this.props.onChangeFunc(this.props.inputName, this.refs.selectInput.value);
    },

    render: function() {
        // Sort options in ascending order
        var selectOptions = _.sortBy(this.props.options, option => {
            return option.text.toUpperCase();
        });

        // Add an empty value to options list if needed
        if (this.props.emptyValue !== undefined) {
            selectOptions.unshift({ value: this.props.emptyValue, text: '' });
        }

        // Make an array of React elements
        selectOptions = _.map(selectOptions, option => {
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
            <div className='dropdown'>
                <select
                    className={ this.props.className || null }
                    value={ this.props.selectedValue }
                    disabled={ !this.props.isEnabled }
                    onChange={ this.handleUserInput }
                    onFocus={ this.props.onFocus }
                    onBlur={ this.props.onBlur }
                    ref='selectInput'
                    >
                    { selectOptions }
                </select>
            </div>
        );
    }
});


module.exports = Dropdown;
