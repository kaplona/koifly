'use strict';

var React = require('react');

var AppLink = require('../app-link');
var InputContainer = require('./input-container');
var Label = require('../section/label');
var ValidationError = require('../section/validation-error');

require('./after-comment.less');


var TextInput = React.createClass({

    propTypes: {
        inputValue: React.PropTypes.string.isRequired,
        labelText: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.element
        ]),
        inputName: React.PropTypes.string.isRequired,
        errorMessage: React.PropTypes.string,
        onChange: React.PropTypes.func.isRequired,
        onMapShow: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
        return {
            inputName: 'coordinates'
        };
    },

    handleUserInput: function() {
        this.props.onChange(this.props.inputName, this.refs.input.getDOMNode().value);
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
                        placeholder='49.281082 -123.120888'
                        onChange={ this.handleUserInput }
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
