import React from 'react';
import { arrayOf, bool, number, shape, string } from 'prop-types';
import { coordinatesPropType, promisePropType } from '../../../constants/prop-types';
import _ from 'lodash';
import mapConstants from '../../../constants/map-constants';
import navigationService from '../../../services/navigation-service';

require('./map.less');


export default class StaticMap extends React.Component {
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
    let markerId;
    let markerPosition;
    let infowindowContent;
    let infowindowOnClickFunc;

    mapFacade.createMap(this.mapEl, this.props.center, this.props.zoomLevel);

    for (let i = 0; i < this.props.sites.length; i++) {
      if (this.props.sites[i].latLng) {
        markerId = this.props.sites[i].id;
        markerPosition = this.props.sites[i].latLng;

        mapFacade.createMarker(markerId, markerPosition);

        infowindowContent = this.composeInfowindowMessage(this.props.sites[i]);
        infowindowOnClickFunc = (siteId => {
          return () => navigationService.goToSiteView(siteId);
        })(markerId);

        mapFacade.createInfowindow(markerId, infowindowContent, infowindowOnClickFunc);
        mapFacade.bindMarkerAndInfowindow(markerId);
      }
    }
  }

  composeInfowindowMessage(site) {
    return `
      <div class="infowindow">
        <div class="infowindow-title" id="site-${_.escape(site.id)}">
          ${_.escape(site.name)}
        </div>
        <div>${_.escape(site.location)}</div>
        <div>
          ${_.escape(site.launchAltitude + ' ' + site.altitudeUnit)}
        </div>
        <div>${_.escape(site.coordinates)}</div>
      </div>
    `;
  }

  render() {
    const className = this.props.isFullScreen ? 'map-container x-full-screen' : 'map-container';

    return (
      <div className={this.props.isFullScreen ? 'static-wrapper' : null}>
        <div className={className} ref={this.setMapRef}/>
      </div>
    );
  }
}


StaticMap.defaultProps = {
  center: mapConstants.CENTER.region,
  zoomLevel: mapConstants.ZOOM_LEVEL.region,
  sites: [],
  isFullScreen: false
};

StaticMap.propTypes = {
  center: coordinatesPropType,
  zoomLevel: number,
  sites: arrayOf(shape({
    id: number.isRequired,
    name: string.isRequired,
    location: string,
    launchAltitude: number,
    altitudeUnit: string,
    coordinates: string,
    latLng: coordinatesPropType
  })),
  isFullScreen: bool,
  mapFacadePromise: promisePropType.isRequired
};

StaticMap.create = function(props) { // eslint-disable-line react/no-multi-comp
  // this loads external google-maps-api
  const mapFacadePromise = require('../../../utils/map-facade').createPromise();

  return (
    <StaticMap
      {...props}
      mapFacadePromise={mapFacadePromise}
    />
  );
};
