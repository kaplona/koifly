'use strict';

var React = require('react');
var Label = require('../section/label');
var InputContainer = require('./input-container');
var Dropdown = require('./dropdown');
var ValidationError = require('../section/validation-error');


var { arrayOf, bool, func, number, oneOfType, shape, string } = React.PropTypes;

var DropdownInput = React.createClass({

    propTypes: {
        selectedValue: oneOfType([string, number]),
        options: arrayOf(shape({
            value: oneOfType([string, number]),
            text: oneOfType([string, number])
        })).isRequired,
        labelText: string,
        inputName: string,
        emptyText: oneOfType([string, number]),
        emptyValue: oneOfType([string, number]),
        noSort: bool,
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
                        emptyText={ this.props.emptyText }
                        emptyValue={ this.props.emptyValue }
                        noSort={ this.props.noSort }
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
