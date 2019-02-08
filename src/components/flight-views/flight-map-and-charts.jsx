'use strict';

const React = require('react');
const { func, number, string } = React.PropTypes;

const igcService = require('../../services/igc-service');
const SiteModel = require('../../models/site');
const ZOOM_LEVEL = require('../../constants/map-constants').ZOOM_LEVEL;

const FlightSynchronizedCharts = require('./flight-synchronized-charts');
const StaticMap = require('../common/maps/static-map');
const TrackMap = require('../common/maps/track-map');


const FightMapAndCharts = React.createClass({
    propTypes: {
        igc: string,
        siteId: number,
    },

    getInitialState() {
        this.parsedIgc = null;
        if (this.props.igc) {
            this.parsedIgc = igcService.parseIgc(this.props.igc);

            if (this.parsedIgc instanceof Error) {
                this.parsedIgc = null;
            } else {
                this.trackCoords = this.parsedIgc.flightPoints.map(({lat, lng}) => ({lat, lng}));
            }
        }


        return {
            highlightedIndex: null,
        };
    },

    handleChartPointHover(index) {
        this.setState({ highlightedIndex: index });
    },

    renderSiteMap() {
        const siteCoordinates = SiteModel.getLatLng(this.props.siteId);
        // this flight has no site or the site has no coordinates
        if (siteCoordinates === null) {
            return null;
        }

        const site = SiteModel.getItemOutput(this.props.siteId);

        return StaticMap.create({
            center: siteCoordinates,
            zoomLevel: ZOOM_LEVEL.site,
            sites: [ site ]
        });
    },

    render() {
        if (!this.parsedIgc) {
            return this.renderSiteMap();
        }

        let highlightedCoords;
        if (this.state.highlightedIndex !== null) {
            highlightedCoords = this.trackCoords[this.state.highlightedIndex];
        }

        return (
            <div>
                {TrackMap.create({
                    trackCoords: this.trackCoords,
                    markerCoords: highlightedCoords,
                })}
                <FlightSynchronizedCharts
                    flightPoints={this.parsedIgc.flightPoints}
                    minAltitude={this.parsedIgc.minAltitude}
                    onPointHover={this.handleChartPointHover}
                />
            </div>
        );
    }
});


module.exports = FightMapAndCharts;
