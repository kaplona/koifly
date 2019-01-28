'use strict';

const React = require('react');
const { element, func, oneOfType, string } = React.PropTypes;
const Button = require('../buttons/button');
const InputContainer = require('./input-container');
const Label = require('../section/label');
const ValidationError = require('../section/validation-error');

require('./file-input.less');


const FileInput = React.createClass({
    propTypes: {
        fileName: string,
        fileTypes: string.isRequired, // comma separated types, which input[type='file'] expects in "accepts" attr
        buttonCaption: oneOfType([string, element]),
        selectedButtonCaption: oneOfType([string, element]),
        errorMessage: string,
        onSelect: func.isRequired,
        onRemove: func.isRequired,
    },

    getDefaultProps: function() {
        return {
            buttonCaption: 'Choose File',
            selectedButtonCaption: 'Choose Another File'
        };
    },

    handleButtonClick: function() {
        if (this.refs.hiddenFileInput) {
            this.refs.hiddenFileInput.click();
        }
    },

    handleFileSelect: function(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        this.props.onSelect(file);
    },

    render: function() {
        return (
            <div className='file-loader-component'>
                {!!this.props.errorMessage && (
                    <ValidationError message={ this.props.errorMessage } />
                )}

                {!!this.props.fileName && (
                    <div className='selected-file'>
                        <Label>Selected file:</Label>
                        <InputContainer>
                            <span className='file-name'>{this.props.fileName}</span>
                            <span className='remove-file' onClick={this.props.onRemove}>
                                {'\u274C'}
                            </span>
                        </InputContainer>
                    </div>
                )}

                <Button
                    caption={this.props.fileName ? this.props.selectedButtonCaption : this.props.buttonCaption}
                    fitContent={true}
                    onClick={this.handleButtonClick}
                />

                <input
                    className='hidden'
                    type='file'
                    accept={this.props.fileTypes}
                    ref='hiddenFileInput'
                    tabIndex='-1'
                    onChange={this.handleFileSelect}
                />
            </div>
        );
    }
});


module.exports = FileInput;
