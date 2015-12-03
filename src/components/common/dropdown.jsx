'use strict';

var React = require('react');


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
        labelText: React.PropTypes.string,
        inputName: React.PropTypes.string.isRequired,
        emptyValue: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        errorMessage: React.PropTypes.string,
        onChangeFunc: React.PropTypes.func.isRequired
    },

    handleUserInput: function() {
        this.props.onChangeFunc(this.props.inputName, this.refs.selectInput.getDOMNode().value);
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
        // Add an empty value to options list if needed
        var selectOptions = this.props.options;
        if (this.props.emptyValue !== undefined) {
            selectOptions.unshift({ value: this.props.emptyValue, text: '' });
        }

        // Make an array of React elements
        selectOptions = this.props.options.map((option) => {
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
                { this.renderErrorMessage() }
                { this.renderLabel() }
                <select
                    className={ (this.props.errorMessage !== null) ? 'error' : '' }
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
