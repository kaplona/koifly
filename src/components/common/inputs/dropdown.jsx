'use strict';

var React = require('react');
var _ = require('lodash');

require('./dropdown.less');


var { arrayOf, bool, func, number, oneOfType, shape, string } = React.PropTypes;

var Dropdown = React.createClass({

    propTypes: {
        selectedValue: oneOfType([string, number]),
        options: arrayOf(shape({
            value: oneOfType([string, number]),
            text: oneOfType([string, number])
        })).isRequired,
        inputName: oneOfType([string, number]),
        emptyText: oneOfType([string, number]),
        emptyValue: oneOfType([string, number]),
        className: string,
        isEnabled: bool.isRequired,
        noSort: bool,
        onChangeFunc: func.isRequired,
        onFocus: func,
        onBlur: func
    },

    getDefaultProps: function() {
        return {
            isEnabled: true,
            noSort: false
        };
    },

    emptyValue: '__EMPTY__',

    handleUserInput: function() {
        let value = this.refs.selectInput.value;
        if (value === this.emptyValue) {
            value = null;
        }
        this.props.onChangeFunc(this.props.inputName, value);
    },

    render: function() {
        // Sort options in ascending order if needed
        let sortedOptions = this.props.options;
        if (!this.props.noSort) {
            sortedOptions = _.sortBy(this.props.options, option => {
                return option.text.toString().toUpperCase();
            });
        }

        // Add an empty value to options list if needed
        if (this.props.emptyValue !== undefined || this.props.emptyText !== undefined) {
            sortedOptions.unshift({
                value: this.props.emptyValue || this.emptyValue,
                text: (this.props.emptyText !== undefined) ? this.props.emptyText : ''
            });
        }

        // Make an array of React elements
        const selectOptions = _.map(sortedOptions, option => {
            return (
                <option key={ option.value } value={ option.value }>
                    { option.text }
                </option>
            );
        });

        return (
            <div className='dropdown'>
                <select
                    className={ this.props.className || null }
                    value={ this.props.selectedValue || this.props.emptyValue || this.emptyValue }
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
