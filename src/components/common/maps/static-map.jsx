'use strict';

var React = require('react');
var browserHistory = require('react-router').browserHistory;
var _ = require('lodash');

const CENTER = require('../../../constants/map-constants').CENTER;
const PROP_TYPES = require('../../../constants/prop-types');
const ZOOM_LEVEL = require('../../../constants/map-constants').ZOOM_LEVEL;


require('./map.less');


var { arrayOf, bool, number, shape, string } = React.PropTypes;

var StaticMap = React.createClass({

    propTypes: {
        center: PROP_TYPES.coordinates.isRequired,
        zoomLevel: number.isRequired,
        sites: arrayOf(shape({
            id: number.isRequired,
            name: string.isRequired,
            location: string,
            launchAltitude: number,
            altitudeUnit: string,
            coordinates: string,
            latLng: PROP_TYPES.coordinates
        })).isRequired,
        isFullScreen: bool.isRequired,
        mapFacadePromise: PROP_TYPES.promise.isRequired
    },

    getDefaultProps: function() {
        return {
            center: CENTER.region, // @TODO current location or last added site
            zoomLevel: ZOOM_LEVEL.region,
            sites: [],
            isFullScreen: false
        };
    },

    componentDidMount: function() {
        this.props.mapFacadePromise.then(mapFacade => {
            this.createMap(mapFacade);
        });
    },

    shouldComponentUpdate: function() {
        return false;
    },

    handleGoToSiteView: function(siteId) {
        browserHistory.push(`/site/${encodeURIComponent(siteId)}`);
    },

    createMap: function(mapFacade) {
        var markerId;
        var markerPosition;
        var infowindowContent;
        var infowindowOnClickFunc;
        var mapContainer = this.refs.map;

        mapFacade.createMap(mapContainer, this.props.center, this.props.zoomLevel);

        for (var i = 0; i < this.props.sites.length; i++) {
            if (this.props.sites[i].latLng) {
                markerId = this.props.sites[i].id;
                markerPosition = this.props.sites[i].latLng;

                mapFacade.createMarker(markerId, markerPosition);

                infowindowContent = this.composeInfowindowMessage(this.props.sites[i]);
                infowindowOnClickFunc = (siteId => {
                    return () => this.handleGoToSiteView(siteId);
                })(markerId);

                mapFacade.createInfowindow(markerId, infowindowContent, infowindowOnClickFunc);
                mapFacade.bindMarkerAndInfowindow(markerId);
            }
        }
    },

    composeInfowindowMessage: function(site) {
        return '<div class="infowindow">' +
                    '<div class="infowindow-title" id="site-' + _.escape(site.id) + '">' +
                        _.escape(site.name) +
                    '</div>' +
                    '<div>' + _.escape(site.location) + '</div>' +
                    '<div>' +
                        _.escape(site.launchAltitude + ' ' + site.altitudeUnit) +
                    '</div>' +
                    '<div>' + _.escape(site.coordinates) + '</div>' +
                '</div>';
    },

    render: function() {
        var className = this.props.isFullScreen ? 'map-container x-full-screen' : 'map-container';

        return (
            <div className={ this.props.isFullScreen ? 'static-wrapper' : null }>
                <div className={ className } ref='map'/>
            </div>
        );
    }
});



StaticMap.create = function(props) {
    // this loads external google-maps-api
    var mapFacadePromise = require('../../../utils/map-facade').createPromise();

    return (
        <StaticMap
            {...props}
            mapFacadePromise={ mapFacadePromise }
            />
    );
};


module.exports = StaticMap;
