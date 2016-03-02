'use strict';

var React = require('react');
var _ = require('lodash');


var DropDown = React.createClass({

    propTypes: {
        selectedValue: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]).isRequired,
        options: React.PropTypes.arrayOf(React.PropTypes.shape({
            value: React.PropTypes.string,
            text: React.PropTypes.string
        })).isRequired,
        inputName: React.PropTypes.string.isRequired,
        emptyValue: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        className: React.PropTypes.string,
        onChangeFunc: React.PropTypes.func.isRequired
    },

    handleUserInput: function() {
        this.props.onChangeFunc(this.props.inputName, this.refs.selectInput.getDOMNode().value);
    },

    render: function() {
        // Sort options in ascending order
        var selectOptions = _.sortBy(this.props.options, (option) => {
            return option.text.toUpperCase();
        });

        // Add an empty value to options list if needed
        if (this.props.emptyValue !== undefined) {
            selectOptions.unshift({ value: this.props.emptyValue, text: '' });
        }

        // Make an array of React elements
        selectOptions = _.map(selectOptions, (option) => {
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
            <select
                className={ this.props.className ? this.props.className : null }
                value={ this.props.selectedValue }
                onChange={ this.handleUserInput }
                ref='selectInput'
                >
                { selectOptions }
            </select>
        );
    }
});


module.exports = DropDown;
