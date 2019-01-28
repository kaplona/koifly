'use strict';

const React = require('react');
const {func, string} = React.PropTypes;
const Button = require('../buttons/button');
const InputContainer = require('./input-container');
const Label = require('../section/label');
const Notice = require('../notice/notice');
const ValidationError = require('../section/validation-error');

require('./file-input.less');


const FileInput = React.createClass({
    propTypes: {
        fileName: string,
        fileTypes: string.isRequired, // comma separated types, which input[type='file'] expects in "accepts" attr
        errorMessage: string,
        onSelect: func.isRequired,
        onRemove: func.isRequired,
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
        if (!window.FileReader || !window.File || !window.FileList || !window.Blob) {
            const message = `
                Your browser doesn't support new html file uploading API.
                Please, upgrade your browser to the latest version, or use Firefox, Chrome, Safari, or Opera browsers.
            `;
            return <Notice type='error' text={ message } />;
        }

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
                    caption={this.props.fileName ? 'Choose Another File' : 'Choose File'}
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
