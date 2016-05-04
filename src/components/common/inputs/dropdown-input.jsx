'use strict';

var React = require('react');
var Label = require('../section/label');
var InputContainer = require('./input-container');
var Dropdown = require('./dropdown');
var ValidationError = require('../section/validation-error');


var { arrayOf, func, number, oneOfType, shape, string } = React.PropTypes;

var DropdownInput = React.createClass({

    propTypes: {
        selectedValue: oneOfType([string, number]).isRequired,
        options: arrayOf(shape({
            value: string,
            text: string
        })).isRequired,
        labelText: string,
        inputName: string.isRequired,
        emptyValue: oneOfType([string, number]),
        errorMessage: string,
        onChangeFunc: func.isRequired,
        onFocus: func,
        onBlur: func
    },

    renderErrorMessage: function() {
        if (this.props.errorMessage) {
            return <ValidationError message={ this.props.errorMessage } />;
        }
    },

    render: function() {
        return (
            <div>
                { this.renderErrorMessage() }

                <Label>
                    { this.props.labelText }
                </Label>

                <InputContainer>
                    <Dropdown
                        className={ (this.props.errorMessage) ? 'x-error' : null }
                        selectedValue={ this.props.selectedValue }
                        options={ this.props.options }
                        inputName={ this.props.inputName }
                        emptyValue={ this.props.emptyValue }
                        onChangeFunc={ this.props.onChangeFunc }
                        onFocus={ this.props.onFocus }
                        onBlur={ this.props.onBlur }
                        />
                </InputContainer>
            </div>
        );
    }
});


module.exports = DropdownInput;
