'use strict';

import React from 'react';
import { arrayOf, bool } from 'prop-types';
import { coordinatesPropType, promisePropType } from '../../../constants/prop-types';
import mapConstants from '../../../constants/map-constants';

require('./map.less');


export default class TrackMap extends React.Component {
  constructor() {
    super();
    this.mapEl = null;
    this.setMapRef = this.setMapRef.bind(this);
  }

  componentDidMount() {
    this.props.mapFacadePromise.then(mapFacade => {
      this.mapFacade = mapFacade;
      this.createMap();
    });
  }

  componentDidUpdate(prevProps) {
    if (this.mapFacade && prevProps.trackCoords !== this.props.trackCoords) {
      this.mapFacade.updateFlightTrack(this.props.trackCoords);
    }
    if (
      this.mapFacade && !!prevProps.markerCoords && !!this.props.markerCoords &&
      prevProps.markerCoords.lat !== this.props.markerCoords.lat &&
      prevProps.markerCoords.lng !== this.props.markerCoords.lng
    ) {
      this.mapFacade.moveTrackMarker(this.props.markerCoords);
    }
  }

  setMapRef(el) {
    this.mapEl = el;
  }

  createMap() {
    const center = this.props.trackCoords[0] || mapConstants.CENTER.region;
    this.mapFacade.createMap(this.mapEl, center, mapConstants.ZOOM_LEVEL.track);

    if (this.props.trackCoords) {
      this.mapFacade.createFlightTrack(this.props.trackCoords);
    }
    if (this.props.markerCoords) {
      this.mapFacade.moveTrackMarker(this.props.markerCoords);
    }
  }

  render() {
    const className = this.props.isFullScreen ? 'map-container x-full-screen' : 'map-container';

    return (
      <div className={this.props.isFullScreen ? 'static-wrapper' : ''}>
        <div className={className} ref={this.setMapRef}/>
      </div>
    );
  }
}


TrackMap.defaultProps = {
  isFullScreen: false
};

TrackMap.propTypes = {
  isFullScreen: bool,
  markerCoords: coordinatesPropType,
  trackCoords: arrayOf(coordinatesPropType).isRequired,
  mapFacadePromise: promisePropType.isRequired
};

TrackMap.create = function(props) { // eslint-disable-line react/no-multi-comp
  // this loads external google-maps-api
  const mapFacadePromise = require('../../../utils/map-facade').createPromise();

  return (
    <TrackMap
      {...props}
      mapFacadePromise={mapFacadePromise}
    />
  );
};
