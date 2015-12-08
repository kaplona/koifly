'use strict';

var React = require('react');
var PubSub = require('../../utils/pubsub');
var Map = require('../../utils/map');
var SiteModel = require('../../models/site');


var StaticMap = React.createClass({

    propTypes: {
        center: React.PropTypes.shape({
            lat: React.PropTypes.number,
            lng: React.PropTypes.number
        }),
        zoomLevel: React.PropTypes.number,
        markers:  React.PropTypes.arrayOf(React.PropTypes.shape({
            id: React.PropTypes.oneOfType([
                React.PropTypes.number,
                React.PropTypes.string
            ]),
            name: React.PropTypes.string,
            location: React.PropTypes.string,
            launchAltitude: React.PropTypes.oneOfType([
                React.PropTypes.number,
                React.PropTypes.string
            ]),
            altitudeUnit: React.PropTypes.string,
            coordinates: React.PropTypes.string
        }))
    },

    getDefaultProps: function() {
        return {
            center: Map.center.region, // TODO current location or last added site
            zoomLevel: Map.zoomLevel.region,
            markers: []
        };
    },

    componentDidMount: function() {
        if (Map.isLoaded) {
            this.createMap();
        } else {
            PubSub.on('mapLoaded', this.createMap, this);
        }
    },

    shouldComponentUpdate: function() {
        return false;
    },

    componentWillUnmount: function() {
        PubSub.removeListener('mapLoaded', this.createMap, this);
        if (Map.isLoaded) {
            Map.unmountMap();
        }
    },

    createMap: function() {
        var markerId, markerPosition, infowindowContent;
        var mapContainer = this.refs.map.getDOMNode();
        Map.createMap(mapContainer, this.props.center, this.props.zoomLevel);
        for (var i = 0; i < this.props.markers.length; i++) {
            if (this.props.markers[i].coordinates) {
                markerId = this.props.markers[i].id;
                markerPosition = SiteModel.getLatLngCoordinates(markerId);
                Map.createMarker(markerId, markerPosition, false);
                infowindowContent = this.composeInfowindowMessage(this.props.markers[i]);
                Map.createInfowindow(markerId, infowindowContent);
                Map.bindMarkerAndInfowindow(markerId);
            }
        }
    },

    composeInfowindowMessage: function(site) {
        return '<div>' +
                '<div><a href="/site/' + site.id + '">' + site.name + '</a></div>' +
                '<div>' + site.location + '</div>' +
                '<div>' + site.launchAltitude + ' ' + site.altitudeUnit + '</div>' +
                '<div>' + site.coordinates + '</div>' +
                '</div>';
    },

    render: function() {
        return <div className='map_container' ref='map'/>;
    }
});

module.exports = StaticMap;
