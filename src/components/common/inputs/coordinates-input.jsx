'use strict';

var React = require('react');

var AppLink = require('../app-link');
var InputContainer = require('./input-container');
var Label = require('../section/label');
var ValidationError = require('../section/validation-error');

require('./after-comment.less');


var { element, func, oneOfType, string } = React.PropTypes;

var TextInput = React.createClass({

    propTypes: {
        inputValue: string.isRequired,
        labelText: oneOfType([
            string,
            element
        ]),
        inputName: string.isRequired,
        errorMessage: string,
        onChange: func.isRequired,
        onMapShow: func.isRequired,
        onFocus: func,
        onBlur: func
    },

    getDefaultProps: function() {
        return {
            inputName: 'coordinates'
        };
    },

    handleUserInput: function() {
        this.props.onChange(this.props.inputName, this.refs.input.value);
    },

    renderErrorMessage: function() {
        if (this.props.errorMessage) {
            return <ValidationError message={ this.props.errorMessage } />;
        }
    },

    render: function() {
        var className = 'x-text';
        if (this.props.errorMessage) {
            className += ' x-error';
        }

        return (
            <div>
                { this.renderErrorMessage() }

                <Label>
                    { this.props.labelText }
                </Label>

                <InputContainer>
                    
                    <input
                        className={ className }
                        value={ this.props.inputValue }
                        type='text'
                        placeholder='ex: 49.281082 -123.120888'
                        onChange={ this.handleUserInput }
                        onFocus={ this.props.onFocus }
                        onBlur={ this.props.onBlur }
                        ref='input'
                        />

                    <div className='after-comment'>
                        <AppLink onClick={ this.props.onMapShow }>or use a map</AppLink>
                    </div>
                    
                </InputContainer>
            </div>
        );
    }
});


module.exports = TextInput;
