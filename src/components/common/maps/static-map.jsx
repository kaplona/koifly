'use strict';

var React = require('react');
var Router = require('react-router');
var History = Router.History;
var _ = require('lodash');

const CENTER = require('../../../constants/map-constants').CENTER;
const PROP_TYPES = require('../../../constants/prop-types');
const ZOOM_LEVEL = require('../../../constants/map-constants').ZOOM_LEVEL;

var SiteModel = require('../../../models/site');

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
            coordinates: string
        })).isRequired,
        isFullScreen: bool.isRequired,
        mapFacadePromise: PROP_TYPES.promise.isRequired
    },

    getDefaultProps: function() {
        return {
            center: CENTER.region, // TODO current location or last added site
            zoomLevel: ZOOM_LEVEL.region,
            sites: [],
            isFullScreen: false
        };
    },

    mixins: [ History ],

    componentDidMount: function() {
        this.props.mapFacadePromise.then((mapFacade) => {
            this.createMap(mapFacade);
        });
    },

    shouldComponentUpdate: function() {
        return false;
    },

    handleToSite: function(siteId) {
        this.history.pushState(null, '/site/' + siteId);
    },

    createMap: function(mapFacade) {
        var markerId, markerPosition, infowindowContent, infowindowOnClickFunc;
        var mapContainer = this.refs.map.getDOMNode();

        mapFacade.createMap(mapContainer, this.props.center, this.props.zoomLevel);

        for (var i = 0; i < this.props.sites.length; i++) {
            if (this.props.sites[i].coordinates) {
                markerId = this.props.sites[i].id;
                markerPosition = SiteModel.getLatLngCoordinates(markerId);

                mapFacade.createMarker(markerId, markerPosition);

                infowindowContent = this.composeInfowindowMessage(this.props.sites[i]);
                infowindowOnClickFunc = ((siteId) => {
                    return () => this.handleToSite(siteId);
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
        var className = this.props.isFullScreen ? 'map_container x-full-screen' : 'map_container';

        return (
            <div>
                <div className={ className } ref='map'/>;
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
