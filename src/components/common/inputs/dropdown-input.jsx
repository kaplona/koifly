'use strict';

var React = require('react');
var Label = require('../section/label');
var Value = require('../section/value-input');
var Dropdown = require('./dropdown');


var DropdownInput = React.createClass({

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
                { this.renderErrorMessage() }

                <Label>
                    { this.renderLabel() }
                </Label>

                <Value>
                    <Dropdown
                        className={ (this.props.errorMessage) ? 'error' : '' }
                        selectedValue={ this.props.selectedValue }
                        options={ this.props.options }
                        inputName={ this.props.inputName }
                        emptyValue={ this.props.emptyValue }
                        onChangeFunc={ this.props.onChangeFunc }
                        />
                </Value>
            </div>
        );
    }
});


module.exports = DropdownInput;
