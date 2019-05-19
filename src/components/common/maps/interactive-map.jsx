'use strict';

const React = require('react');
const {func, number, string} = React.PropTypes;
const _ = require('lodash');
const Altitude = require('../../../utils/altitude');

const CENTER = require('../../../constants/map-constants').CENTER;
const OUT_OF_MAP_COORDINATES = require('../../../constants/map-constants').OUT_OF_MAP_COORDINATES;
const PROP_TYPES = require('../../../constants/prop-types');
const UNKNOWN_ADDRESS = require('../../../constants/map-constants').UNKNOWN_ADDRESS;
const UNKNOWN_ELEVATION = require('../../../constants/map-constants').UNKNOWN_ELEVATION;
const ZOOM_LEVEL = require('../../../constants/map-constants').ZOOM_LEVEL;

require('./map.less');


const InteractiveMap = React.createClass({

  propTypes: {
    markerId: number.isRequired,
    center: PROP_TYPES.coordinates.isRequired,
    zoomLevel: number.isRequired,
    markerPosition: PROP_TYPES.coordinates.isRequired,
    location: string.isRequired,
    launchAltitude: string.isRequired,
    altitudeUnit: string.isRequired,
    onDataApply: func.isRequired,
    onMapClose: func.isRequired,
    mapFacadePromise: PROP_TYPES.promise.isRequired
  },

  getDefaultProps: function () {
    return {
      markerId: 0,
      center: CENTER.region, // @TODO current location or last added site
      zoomLevel: ZOOM_LEVEL.region,
      markerPosition: OUT_OF_MAP_COORDINATES,
      location: '',
      launchAltitude: '',
      altitudeUnit: 'meters'
    };
  },

  componentDidMount: function () {
    this.props.mapFacadePromise.then(mapFacade => {
      this.createMap(mapFacade);
    });
  },

  shouldComponentUpdate: function () {
    return false;
  },

  createMap: function (mapFacade) {
    mapFacade.createMap(this.refs.map, this.props.center, this.props.zoomLevel);
    mapFacade.createMarker(this.props.markerId, this.props.markerPosition, true, this.changeInfowindowContent);
    mapFacade.createInfowindow(this.props.markerId, '');
    mapFacade.bindMarkerAndInfowindow(this.props.markerId);
    mapFacade.addSearchBarControl(this.props.markerId);

    if (this.props.markerPosition !== OUT_OF_MAP_COORDINATES) {
      mapFacade
        .getPositionInfoPromise(this.props.markerPosition)
        .then(positionInfo => {
          this.changeInfowindowContent(positionInfo, mapFacade);
        });
    }
  },

  changeInfowindowContent: function (positionInfo, mapFacade) {
    // Format infowindow content
    const location = positionInfo.address;
    const coordinates = positionInfo.coordinates;
    let altitude = positionInfo.elevation;
    if (altitude !== UNKNOWN_ELEVATION) {
      // Convert to user altitude unit as Google map returns elevation in meters
      altitude = Altitude.getAltitudeInPilotUnits(parseFloat(altitude));
    }
    const infowindowContentHtml = this.composeInfowindowMessage(location, altitude, coordinates);

    mapFacade.setInfowindowContent(this.props.markerId, infowindowContentHtml);
    mapFacade.openInfowindow(this.props.markerId);

    document.getElementById('apply_google_data').addEventListener('click', () => {
      this.applyGoogleData(location, positionInfo.elevation, coordinates);
    });

    document.getElementById('close_map').addEventListener('click', () => {
      this.props.onMapClose();
    });
  },

  composeInfowindowMessage: function (location, altitude, coordinates) {
    // Mark checkbox as checked if related form field is empty
    // Checked values will then be transferred to the fields
    const checkboxParameters = {
      location: this.props.location ? '' : 'checked',
      launchAltitude: this.props.launchAltitude ? '' : 'checked'
    };
    // Disable checkbox if no google results for it
    if (location === UNKNOWN_ADDRESS) {
      checkboxParameters.location = 'disabled';
    }
    if (altitude === UNKNOWN_ELEVATION) {
      checkboxParameters.launchAltitude = 'disabled';
    }

    const altitudeUnit = (altitude !== 'unknown elevation') ? (' ' + Altitude.getUserAltitudeUnit()) : '';

    return '<div class="infowindow">' +
      '<div>' +
      '<input id="location_checkbox" type="checkbox" ' + checkboxParameters.location +
      ' style="display:inline;width:12px;">' +
      '<label for="location_checkbox">' + _.escape(location) + '</label>' +
      '</div>' +
      '<div>' +
      '<input id="launchAltitude_checkbox" type="checkbox" ' + checkboxParameters.launchAltitude +
      ' style="display:inline;width:12px;">' +
      '<label for="launchAltitude_checkbox">' +
      _.escape(altitude + ' ' + altitudeUnit) +
      '</label>' +
      '</div>' +
      '<div>' +
      '<input type="checkbox" style="display:inline;width:12px;" checked disabled>' +
      _.escape(coordinates) +
      '</div>' +
      '<button id="apply_google_data" type="button" class="infowindow-button">Apply</button>' +
      '<button id="close_map" type="button" class="infowindow-button">Close Map</button>' +
      '</div>';
  },

  applyGoogleData: function (location, elevation, coordinates) {
    // If transferring address
    if (document.getElementById('location_checkbox').checked) {
      this.props.onDataApply('location', location);
    }
    // If transferring elevation
    if (document.getElementById('launchAltitude_checkbox').checked) {
      // Convert elevation into units that user chose in the form
      const altitudeUnit = this.props.altitudeUnit;
      const launchAltitude = Altitude.getAltitudeInGivenUnits(parseFloat(elevation), altitudeUnit).toString();
      this.props.onDataApply('launchAltitude', launchAltitude);
    }
    // Coordinates transfers anyway
    this.props.onDataApply('coordinates', coordinates);
    this.props.onMapClose();
  },

  render: function () {
    return (
      <div className='interactive-wrapper'>
        <div className='map-container x-full-screen' ref='map'/>
        <div className='dimmer' onClick={this.props.onMapClose}/>
      </div>
    );
  }
});


InteractiveMap.create = function (props) { // eslint-disable-line react/no-multi-comp
  // this loads external google-maps-api
  const mapFacadePromise = require('../../../utils/map-facade').createPromise();

  return (
    <InteractiveMap
      {...props}
      mapFacadePromise={mapFacadePromise}
    />
  );
};

module.exports = InteractiveMap;
