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

    this.handleFile = this.handleFile.bind(this);
    this.handleRemoveFile = this.handleRemoveFile.bind(this);
  }

  componentDidMount() {
    if (!this.props.igc) {
      return;
    }
    let validationError = null;
    let parsedFile = igcService.parseIgc(this.props.igc);

    if (parsedFile instanceof Error) {
      parsedFile = null;
      validationError = parsedFile;
    }

    this.setState({ parsedIgc: parsedFile, validationError });
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

  validateFile(file) {
    const lowerCaseName = file.name.toLowerCase();

    const errors = [];
    if (!lowerCaseName.includes('.igc')) {
      errors.push('File must be .igc format.');
    }
    if (file.size > 1048576) {
      errors.push('File must be less than 1MB');
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
}


FightTrackUpload.propTypes = {
  igc: string,
  onLoad: func.isRequired
};
