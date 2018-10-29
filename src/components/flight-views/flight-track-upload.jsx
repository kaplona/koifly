'use strict';

const React = require('react');
const { func } = React.PropTypes;
const Altitude = require('../../utils/altitude');
const ErrorTypes = require('../../errors/error-types');
const igcService = require('../../services/igc-service');
const KoiflyError = require('../../errors/error');
const Util = require('../../utils/util');

const ErrorBox = require('../common/notice/error-box');
const TrackMap = require('../common/maps/track-map');

require('./flight-track-upload.less');


const FightTrackUpload = React.createClass({

    propTypes: {
        onLoad: func.isRequired
    },

    getInitialState: function() {
        return {
            dataUri: null,
            error: null,
            igcData: null
        };
    },

    handleFile: function(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        this.setState({
            dataUri: null,
            error: null,
            igcData: null
        });

        const validationError = this.validateFile(file);
        if (validationError) {
            this.setState({ error: validationError });
            return;
        }

        const reader = new FileReader();
        reader.onload = upload => {
            const parsedFile = igcService.parseIgc(upload.target.result);

            if (parsedFile instanceof Error) {
                this.setState({ error: parsedFile });
                return;
            }

            this.props.onLoad(parsedFile, upload.target.result);
            this.setState({ igcData: parsedFile });
        };
        reader.onerror = error => {
            this.setState({ error });
        };

        reader.readAsText(file);
    },

    validateFile(file) {
        const lowerCaseName = file.name.toLowerCase();

        let errors = [];
        if (!lowerCaseName.includes('.igc')) {
            errors.push('File must be .igc format.');
        }
        if (file.size > 1048576) {
            errors.push('File must be less than 1MB');
        }

        return errors.length ? new KoiflyError(ErrorTypes.VALIDATION_ERROR, errors.join(' ')) : null;
    },

    renderMap: function() {
        const trackCoords = this.state.igcData.flightPoints.map(({ lat, lng }) => ({ lat, lng }));

        return TrackMap.create({
            trackCoords: trackCoords
        });
    },

    render: function() {
        return (
            <div>
                <input type='file' accept='.igc' onChange={ this.handleFile } />

                { this.state.igcData && (
                    <div>
                        <div className='flight-track-upload-map'>{ this.renderMap() }</div>
                        <div>
                            Airtime: { Util.formatTime(this.state.igcData.airtime) },{ '\u0020' }
                            max altitude: { Altitude.formatAltitude(this.state.igcData.maxAltitude) }
                        </div>
                    </div>
                ) }

                { this.state.error && <ErrorBox error={ this.state.error } /> }
            </div>
        );
    }
});


module.exports = FightTrackUpload;
