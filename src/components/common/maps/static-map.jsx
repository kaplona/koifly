import React from 'react';
import { arrayOf, bool, number, shape, string } from 'prop-types';
import { coordinatesPropType } from '../../../constants/prop-types';
import _ from 'lodash';
import mapConstants from '../../../constants/map-constants';
import MapFacade from '../../../utils/map-facade';
import navigationService from '../../../services/navigation-service';

require('./map.less');


export default class StaticMap extends React.Component {
  constructor() {
    super();
    this.mapEl = null;
    this.setMapRef = this.setMapRef.bind(this);
  }

  componentDidMount() {
    MapFacade.createPromise().then(mapInstance => {
      this.createMap(mapInstance);
    });
  }

  shouldComponentUpdate() {
    return false;
  }

  setMapRef(el) {
    this.mapEl = el;
  }

  createMap(mapInstance) {
    mapInstance.createMap(this.mapEl, this.props.center, this.props.zoomLevel);

    this.props.sites.forEach(site => {
      if (!site.latLng) return;

      const markerId = site.id;
      const infowindowContent = this.composeInfowindowMessage(site);
      const infowindowOnClickFunc = () => navigationService.goToSiteView(site.id);

      mapInstance.createMarker(markerId, site.latLng);
      mapInstance.createInfowindow(markerId, infowindowContent, infowindowOnClickFunc);
      mapInstance.bindMarkerAndInfowindow(markerId);
    });
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
  isFullScreen: bool
};
