import React from 'react';
import { func, string } from 'prop-types';
import Altitude from '../../utils/altitude';
import ErrorBox from '../common/notice/error-box';
import errorTypes from '../../errors/error-types';
import FileInput from '../common/inputs/file-input';
import igcService from '../../services/igc-service';
import KoiflyError from '../../errors/error';
import SiteModel from '../../models/site';
import TrackMap from '../common/maps/track-map';
import Util from '../../utils/util';

require('./flight-track-upload.less');


export default class FightTrackUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName: this.props.igc ? 'previously loaded IGC file' : null,
      fileReadError: null,
      parsedIgc: null,
      validationError: null
    };
    this.__isMounted__ = true;

    this.handleFile = this.handleFile.bind(this);
    this.handleRemoveFile = this.handleRemoveFile.bind(this);
  }

  componentDidMount() {
    if (!this.props.igc) {
      return;
    }
    this.parseIgc(this.props.igc);
  }

  componentWillUnmount() {
    this.__isMounted__ = false;
  }

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

      this.parseIgc(igc)
        .then(parsedFile => {
          if (!this.__isMounted__) return;
          this.props.onLoad(parsedFile, igc, this.state.fileName);
        });
    };
    reader.onerror = error => {
      const errorMessage = `Couldn't read file "file.name". Error type: ${error.type}`;
      this.setState({ fileReadError: { message: errorMessage } });
    };

    this.setState({ isLoading: true });
    reader.readAsText(file);
  }

  handleRemoveFile() {
    this.setState({
      fileName: null,
      fileReadError: null,
      parsedIgc: null,
      validationError: null
    });
    this.props.onLoad();
  }

  parseIgc(igc) {
    this.setState({ isLoading: true });
    return igcService
      .parseIgc(igc)
      .then(parsedIgc => {
        if (!this.__isMounted__) return;
        this.setState({
          parsedIgc,
          validationError: null,
          isLoading: false
        });
        return parsedIgc;
      })
      .catch(err => {
        if (!this.__isMounted__) return;
        const validationError = err instanceof KoiflyError
          ? err
          : new Error('Couldn\'t parse your IGC file.');
        this.setState({
          parsedIgc: null,
          validationError,
          isLoading: false
        });
      });
  }

  validateFile(file) {
    const lowerCaseName = file.name.toLowerCase();

    const errors = [];
    if (!lowerCaseName.includes('.igc')) {
      errors.push('File must be .igc format.');
    }
    if (file.size > 2097152) {
      errors.push('File must be less than 2MB');
    }

    return errors.length ? new KoiflyError(errorTypes.VALIDATION_ERROR, errors.join(' ')) : null;
  }

  renderMap() {
    const trackCoords = this.state.parsedIgc.flightPoints.map(({ lat, lng }) => ({ lat, lng }));

    return <TrackMap trackCoords={trackCoords} />;
  }

  render() {
    return (
      <div className='flight-track-upload-component'>
        {this.state.fileReadError && <ErrorBox error={this.state.fileReadError}/>}

        <FileInput
          fileName={this.state.fileName}
          fileTypes='.igc'
          errorMessage={this.state.validationError ? this.state.validationError.message : null}
          isLoading={this.state.isLoading}
          onSelect={this.handleFile}
          onRemove={this.handleRemoveFile}
        />

        {this.state.parsedIgc && (
          <div>
            <div className='map'>{this.renderMap()}</div>
            <div className='stats'>
              Date: {Util.formatDate(this.state.parsedIgc.date) || 'Unknown'}
              ,{'\u0020'}
              Time: {this.state.parsedIgc.time || 'Unknown'} {this.state.parsedIgc.tz ? '' : ' UTC(!)'}
              {'\u0020'}
              (time zone: {this.state.parsedIgc.tz || 'Unknown'}
              ),{'\u0020'}
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
}


FightTrackUpload.propTypes = {
  igc: string,
  onLoad: func.isRequired
};
