import React from 'react';
import { bool, func, string } from 'prop-types';
import Button from '../buttons/button';
import InputContainer from './input-container';
import Label from '../section/label';
import Notice from '../notice/notice';
import ValidationError from '../section/validation-error';
import Loader from '../loader';

require('./file-input.less');


export default class FileInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleFileSelect = this.handleFileSelect.bind(this);
  }

  handleButtonClick() {
    // File input is always uncontrolled, so we can't remove file from the input.
    // Resulting bug: user removes selected file in the UI, but file is still selected in the file input,
    // resulting in the user inability to select the same file again.
    // Fix: two different inputs are rendered depending on whether a file is selected.
    // Effectively I replace one input in the DOM with another thus clearing the selected file.
    if (this.hiddenFileInput) {
      this.hiddenFileInput.click();
    }
    if (this.hiddenAnotherFileInput) {
      this.hiddenAnotherFileInput.click();
    }
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    this.props.onSelect(file);
  }

  render() {
    if (!window.FileReader || !window.File || !window.FileList || !window.Blob) {
      const message = `
        Your browser doesn't support new html file uploading API.
        Please, upgrade your browser to the latest version, or use Firefox, Chrome, Safari, or Opera browsers.
      `;
      return <Notice type='error' text={message}/>;
    }

    return (
      <div className='file-loader-component'>
        {!!this.props.errorMessage && (
          <ValidationError message={this.props.errorMessage}/>
        )}

        {!!this.props.fileName && (
          <div className='selected-file'>
            <Label>Selected file:</Label>
            <InputContainer>
              <div className='file-name-container'>
                <span className='file-name'>{this.props.fileName}</span>
                <span className='remove-file' onClick={this.props.onRemove}>
                  {'\u274C'}
                </span>
              </div>
            </InputContainer>
          </div>
        )}

        <div className='button-container'>
          <Button
            caption={this.props.fileName ? 'Choose Another File' : 'Choose File'}
            isAllScreens={!this.props.fileName}
            isFitContent={true}
            onClick={this.handleButtonClick}
          />

          {this.props.isLoading && (
            <Loader className='loader' />
          )}
        </div>

        {!this.props.fileName && (
          <input
            className='hidden'
            type='file'
            accept={this.props.fileTypes}
            ref={el => this.hiddenFileInput = el}
            tabIndex='-1'
            onChange={this.handleFileSelect}
          />
        )}
        {!!this.props.fileName && (
          <input
            className='hidden'
            type='file'
            accept={this.props.fileTypes}
            ref={el => this.hiddenAnotherFileInput = el}
            tabIndex='-1'
            onChange={this.handleFileSelect}
          />
        )}
      </div>
    );
  }
}


FileInput.propTypes = {
  fileName: string,
  fileTypes: string.isRequired, // comma separated types, which input[type='file'] expects in "accepts" attr
  errorMessage: string,
  isLoading: bool,
  onSelect: func.isRequired,
  onRemove: func.isRequired
};
