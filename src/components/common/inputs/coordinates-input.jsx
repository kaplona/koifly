'use strict';

const React = require('react');
const { element, func, oneOfType, string } = React.PropTypes;
const AppLink = require('../app-link');
const InputContainer = require('./input-container');
const Label = require('../section/label');
const ValidationError = require('../section/validation-error');

require('./after-comment.less');


const TextInput = React.createClass({

    propTypes: {
        inputValue: string.isRequired,
        labelText: oneOfType([
            string,
            element
        ]),
        inputName: string,
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
            return <ValidationError message={this.props.errorMessage} />;
        }
    },

    render: function() {
        let className = 'x-text';
        if (this.props.errorMessage) {
            className += ' x-error';
        }

        return (
            <div>
                {this.renderErrorMessage()}

                <Label>
                    {this.props.labelText}
                </Label>

                <InputContainer>
                    
                    <input
                        className={className}
                        value={this.props.inputValue}
                        type='text'
                        placeholder='ex: 49.281082 -123.120888'
                        onChange={this.handleUserInput}
                        onFocus={this.props.onFocus}
                        onBlur={this.props.onBlur}
                        ref='input'
                    />

                    <div className='after-comment'>
                        <AppLink onClick={this.props.onMapShow}>or use a map</AppLink>
                    </div>
                    
                </InputContainer>
            </div>
        );
    }
});


module.exports = TextInput;
