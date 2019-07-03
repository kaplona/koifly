import React from 'react';
import { func, string } from 'prop-types';
import Button from '../buttons/button';
import InputContainer from './input-container';
import Label from '../section/label';
import Notice from '../notice/notice';
import ValidationError from '../section/validation-error';

require('./file-input.less');


export default class FileInput extends React.Component {
  constructor() {
    super();
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleFileSelect = this.handleFileSelect.bind(this);
  }

  handleButtonClick() {
    if (this.hiddenFileInput) {
      this.hiddenFileInput.click();
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
              <span className='file-name'>{this.props.fileName}</span>
              <span className='remove-file' onClick={this.props.onRemove}>
                {'\u274C'}
              </span>
            </InputContainer>
          </div>
        )}

        <Button
          caption={this.props.fileName ? 'Choose Another File' : 'Choose File'}
          isFitContent={true}
          onClick={this.handleButtonClick}
        />

        <input
          className='hidden'
          type='file'
          accept={this.props.fileTypes}
          ref={el => this.hiddenFileInput = el}
          tabIndex='-1'
          onChange={this.handleFileSelect}
        />
      </div>
    );
  }
}


FileInput.propTypes = {
  fileName: string,
  fileTypes: string.isRequired, // comma separated types, which input[type='file'] expects in "accepts" attr
  errorMessage: string,
  onSelect: func.isRequired,
  onRemove: func.isRequired
};
