'use strict';

const React = require('react');
const { func, string } = React.PropTypes;
const Altitude = require('../../utils/altitude');
const ErrorBox = require('../common/notice/error-box');
const ErrorTypes = require('../../errors/error-types');
const FileInput = require('../common/inputs/file-input');
const igcService = require('../../services/igc-service');
const KoiflyError = require('../../errors/error');
const SiteModel = require('../../models/site');
const TrackMap = require('../common/maps/track-map');
const Util = require('../../utils/util');

require('./flight-track-upload.less');


const FightTrackUpload = React.createClass({
  propTypes: {
    igc: string,
    onLoad: func.isRequired
  },

  getInitialState() {
    let validationError = null;
    let parsedFile = null;
    if (this.props.igc) {
      parsedFile = igcService.parseIgc(this.props.igc);
    }
    if (parsedFile instanceof Error) {
      parsedFile = null;
      validationError = parsedFile;
    }

    return {
      fileName: this.props.igc ? 'previously loaded IGC file' : null,
      fileReadError: null,
      parsedIgc: parsedFile,
      validationError: validationError
    };
  },

  handleFile(file) {
    this.setState({
      fileName: file.name,
      fileReadError: null,
      validationError: null
    });

    const validationError = this.validateFile(file);
    if (validationError) {
      this.setState({
        parsedIgc: null,
        validationError: validationError
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = upload => {
      const igc = upload.target.result;
      const parsedFile = igcService.parseIgc(igc);

      if (parsedFile instanceof Error) {
        this.setState({
          parsedIgc: null,
          validationError: parsedFile
        });
        return;
      }

      this.props.onLoad(parsedFile, igc);
      this.setState({ parsedIgc: parsedFile });
    };
    reader.onerror = error => {
      this.setState({ fileReadError: error });
    };

    reader.readAsText(file);
  },

  handleRemoveFile() {
    this.setState({
      fileName: null,
      fileReadError: null,
      parsedIgc: null,
      validationError: null
    });
    this.props.onLoad();
  },

  validateFile(file) {
    const lowerCaseName = file.name.toLowerCase();

    const errors = [];
    if (!lowerCaseName.includes('.igc')) {
      errors.push('File must be .igc format.');
    }
    if (file.size > 1048576) {
      errors.push('File must be less than 1MB');
    }

    return errors.length ? new KoiflyError(ErrorTypes.VALIDATION_ERROR, errors.join(' ')) : null;
  },

  renderMap() {
    const trackCoords = this.state.parsedIgc.flightPoints.map(({ lat, lng }) => ({ lat, lng }));

    return TrackMap.create({
      trackCoords: trackCoords
    });
  },

  render() {
    return (
      <div className='flight-track-upload-component'>
        {this.state.fileReadError && <ErrorBox error={this.state.fileReadError}/>}

        <FileInput
          fileName={this.state.fileName}
          fileTypes='.igc'
          errorMessage={this.state.validationError ? this.state.validationError.message : null}
          onSelect={this.handleFile}
          onRemove={this.handleRemoveFile}
        />

        {this.state.parsedIgc && (
          <div>
            <div className='map'>{this.renderMap()}</div>
            <div className='stats'>
              Date: {Util.formatDate(this.state.parsedIgc.date) || 'Unknown'}
              ,{'\u0020'}
              airtime: {Util.formatTime(this.state.parsedIgc.airtime)}
              ,{'\u0020'}
              max altitude: {Altitude.formatAltitude(this.state.parsedIgc.maxAltitude)}
              ,{'\u0020'}
              nearest site: {SiteModel.getSiteName(this.state.parsedIgc.siteId) || 'None'}
            </div>
          </div>
        )}
      </div>
    );
  }
});


module.exports = FightTrackUpload;
