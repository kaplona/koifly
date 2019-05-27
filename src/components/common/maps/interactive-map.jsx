'use strict';

import React from 'react';
import { func, number, string } from 'prop-types';
import { coordinatesPropType, promisePropType } from '../../../constants/prop-types';
import _ from 'lodash';
import Altitude from '../../../utils/altitude';
import mapConstants from '../../../constants/map-constants';

require('./map.less');


export default class InteractiveMap extends React.Component {
  constructor() {
    super();
    this.mapEl = null;
    this.setMapRef = this.setMapRef.bind(this);
  }

  componentDidMount() {
    this.props.mapFacadePromise.then(mapFacade => {
      this.createMap(mapFacade);
    });
  }

  shouldComponentUpdate() {
    return false;
  }

  setMapRef(el) {
    this.mapEl = el;
  }

  createMap(mapFacade) {
    mapFacade.createMap(this.mapEl, this.props.center, this.props.zoomLevel);
    mapFacade.createMarker(this.props.markerId, this.props.markerPosition, true, this.changeInfowindowContent);
    mapFacade.createInfowindow(this.props.markerId, '');
    mapFacade.bindMarkerAndInfowindow(this.props.markerId);
    mapFacade.addSearchBarControl(this.props.markerId);

    if (this.props.markerPosition !== mapConstants.OUT_OF_MAP_COORDINATES) {
      mapFacade
        .getPositionInfoPromise(this.props.markerPosition)
        .then(positionInfo => {
          this.changeInfowindowContent(positionInfo, mapFacade);
        });
    }
  }

  changeInfowindowContent(positionInfo, mapFacade) {
    // Format infowindow content
    const location = positionInfo.address;
    const coordinates = positionInfo.coordinates;
    let altitude = positionInfo.elevation;
    if (altitude !== mapConstants.UNKNOWN_ELEVATION) {
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
  }

  composeInfowindowMessage(location, altitude, coordinates) {
    // Mark checkbox as checked if related form field is empty
    // Checked values will then be transferred to the fields
    // Disable checkbox if no google results for it
    const isLocationChecked = !this.props.location;
    const isUnknownLocation = (location === mapConstants.UNKNOWN_ADDRESS);
    const isAltitudeChecked = !this.props.launchAltitude;
    const isUnknownElevation = (altitude === mapConstants.UNKNOWN_ELEVATION);
    const altitudeUnit = (altitude !== 'unknown elevation') ? (' ' + Altitude.getUserAltitudeUnit()) : '';

    return `
      <div class="infowindow">
        <div>
          <input
            id="location_checkbox"
            type="checkbox"
            ${isLocationChecked && !isUnknownLocation ? 'checked' : ''}
            ${isUnknownLocation ? 'disabled' : ''}
            style="display:inline;width:12px;"
          >
          <label for="location_checkbox">${_.escape(location)}</label>
        </div>
        <div>
          <input
            id="launchAltitude_checkbox"
            type="checkbox"
            ${isAltitudeChecked && !isUnknownElevation ? 'checked' : ''}
            ${isUnknownElevation ? 'disabled' : ''}
            style="display:inline;width:12px;"
          >
          <label for="launchAltitude_checkbox">
            ${_.escape(altitude + ' ' + altitudeUnit)}
          </label>
        </div>
        <div>
          <input type="checkbox" style="display:inline;width:12px;" checked disabled>
          ${_.escape(coordinates)}
        </div>
        <button id="apply_google_data" type="button" class="infowindow-button">Apply</button>
        <button id="close_map" type="button" class="infowindow-button">Close Map</button>
      </div>
    `;
  }

  applyGoogleData(location, elevation, coordinates) {
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
  }

  render() {
    return (
      <div className='interactive-wrapper'>
        <div className='map-container x-full-screen' ref={this.setMapRef}/>
        <div className='dimmer' onClick={this.props.onMapClose}/>
      </div>
    );
  }
}


InteractiveMap.defaultProps = {
  markerId: 0,
  center: mapConstants.CENTER.region,
  zoomLevel: mapConstants.ZOOM_LEVEL.region,
  markerPosition: mapConstants.OUT_OF_MAP_COORDINATES,
  location: '',
  launchAltitude: '',
  altitudeUnit: 'meters'
};

InteractiveMap.propTypes = {
  markerId: number.isRequired,
  center: coordinatesPropType.isRequired,
  zoomLevel: number.isRequired,
  markerPosition: coordinatesPropType.isRequired,
  location: string.isRequired,
  launchAltitude: string.isRequired,
  altitudeUnit: string.isRequired,
  onDataApply: func.isRequired,
  onMapClose: func.isRequired,
  mapFacadePromise: promisePropType.isRequired
};

InteractiveMap.create = function(props) { // eslint-disable-line react/no-multi-comp
  // this loads external google-maps-api
  const mapFacadePromise = require('../../../utils/map-facade').createPromise();

  return (
    <InteractiveMap
      {...props}
      mapFacadePromise={mapFacadePromise}
    />
  );
};
