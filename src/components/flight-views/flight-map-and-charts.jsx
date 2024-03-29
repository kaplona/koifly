import React from 'react';
import { number, string } from 'prop-types';
import FlightSynchronizedCharts from './flight-synchronized-charts';
import igcService from '../../services/igc-service';
import mapConstants from '../../constants/map-constants';
import StaticMap from '../common/maps/static-map';
import SiteModel from '../../models/site';
import TrackMap from '../common/maps/track-map';


export default class FightMapAndCharts extends React.Component {
  constructor() {
    super();
    this.state = {
      highlightedIndex: null,
      trackDetails: null
    };

    this.handleChartPointHover = this.handleChartPointHover.bind(this);
  }

  componentDidMount() {
    if (this.props.igc) {
      const trackDetails = igcService.getIgcTrackDetails(this.props.igc);

      this.setState({ trackDetails });
      this.trackCoords = trackDetails.flightPoints.map(({ lat, lng }) => ({ lat, lng }));
    }
  }

  handleChartPointHover(index) {
    this.setState({ highlightedIndex: index });
  }

  renderSiteMap() {
    const siteCoordinates = SiteModel.getLatLng(this.props.siteId);
    // this flight has no site or the site has no coordinates
    if (siteCoordinates === null) {
      return null;
    }

    const site = SiteModel.getItemOutput(this.props.siteId);
    return (
      <StaticMap
        center={siteCoordinates}
        zoomLevel={mapConstants.ZOOM_LEVEL.site}
        sites={[ site ]}
      />
    );
  }

  render() {
    if (!this.state.trackDetails) {
      return this.renderSiteMap();
    }

    let highlightedCoords;
    if (this.state.highlightedIndex !== null) {
      highlightedCoords = this.trackCoords[this.state.highlightedIndex];
    }

    return (
      <div>
        <TrackMap
          trackCoords={this.trackCoords}
          markerCoords={highlightedCoords}
        />
        <FlightSynchronizedCharts
          flightPoints={this.state.trackDetails.flightPoints}
          minAltitude={this.state.trackDetails.minAltitude}
          onPointHover={this.handleChartPointHover}
        />
      </div>
    );
  }
}


FightMapAndCharts.propTypes = {
  igc: string,
  siteId: number
};
