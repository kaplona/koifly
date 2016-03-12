'use strict';

var React = require('react');
var _ = require('lodash');
var PubSub = require('../../../utils/pubsub');
var Map = require('../../../utils/map');
var Altitude = require('../../../utils/altitude');

require('./map.less');


var InteractiveMap = React.createClass({

    propTypes: {
        markerId:  React.PropTypes.number.isRequired,
        center: React.PropTypes.shape({
            lat: React.PropTypes.number,
            lng: React.PropTypes.number
        }).isRequired,
        zoomLevel: React.PropTypes.number.isRequired,
        markerPosition: React.PropTypes.shape({
            lat: React.PropTypes.number,
            lng: React.PropTypes.number
        }).isRequired,
        location: React.PropTypes.string.isRequired,
        launchAltitude: React.PropTypes.string.isRequired,
        altitudeUnit: React.PropTypes.string.isRequired,
        onDataApply: React.PropTypes.func.isRequired,
        onMapClose: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
        return {
            markerId: 0,
            center: Map.center.region, // TODO current location or last added site
            zoomLevel: Map.zoomLevel.region,
            markerPosition: Map.outOfMapCoordinates,
            location: '',
            launchAltitude: '',
            altitudeUnit: 'meters'
        };
    },

    componentWillMount: function() {
        PubSub.on('infowindowContentChanged', this.changeInfowindowContent, this);
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
        PubSub.removeListener('infowindowContentChanged', this.changeInfowindowContent, this);
        PubSub.removeListener('mapLoaded', this.createMap, this);
        if (Map.isLoaded) {
            Map.unmountMap();
        }
    },

    createMap: function() {
        var mapContainer = this.refs.map.getDOMNode();
        Map.createMap(mapContainer, this.props.center, this.props.zoomLevel);
        Map.createMarker(this.props.markerId, this.props.markerPosition, true);
        Map.addMarkerMoveEventListner(this.props.markerId);
        Map.createInfowindow(this.props.markerId, '');
        Map.bindMarkerAndInfowindow(this.props.markerId);
        if (this.props.markerPosition !== null) {
            Map.requestPositionInfo(this.props.markerPosition);
        }
    },

    changeInfowindowContent: function(infowindowContent) {
        // If all google map information requests were completed
        if (infowindowContent.address !== undefined &&
            infowindowContent.elevation !== undefined &&
            infowindowContent.coordinates !== undefined
        ) {
            // Format infowindow content
            var address = infowindowContent.address;
            var altitude = infowindowContent.elevation;
            if (altitude !== 'unknown elevation') {
                // Convert to user altitude unit as Google map returns elevation in meters
                altitude = Altitude.getAltitudeInPilotUnits(parseFloat(altitude));
            }
            var coordinates = infowindowContent.coordinates;
            var infowindowContentHtml = this.composeInfowindowMessage(address, altitude, coordinates);

            Map.setInfowindowContent(this.props.markerId, infowindowContentHtml);
            Map.openInfowindow(this.props.markerId);

            document.getElementById('apply_google_data').addEventListener('click', () => {
                this.applyGoogleData(address, infowindowContent.elevation, coordinates);
            });

            document.getElementById('close_map').addEventListener('click', () => {
                this.props.onMapClose();
            });
        }
    },

    composeInfowindowMessage: function(location, altitude, coordinates) {
        // Mark checkbox as checked if related form field is empty
        // Checked values will then be tranfered to the fields
        var checkboxParameters = {
            location: this.props.location ? '' : 'checked',
            launchAltitude: this.props.launchAltitude ? '' : 'checked'
        };
        // Disable checkbox if no google results for it
        if (location === 'unknown address') {
            checkboxParameters.location = 'disabled';
        }
        if (altitude === 'unknown elevation') {
            checkboxParameters.launchAltitude = 'disabled';
        }

        var altitudeUnit = (altitude !== 'unknown elevation') ? (' ' + Altitude.getUserAltitudeUnit()) : '';

        return '<div class="infowindow">' +
                    '<div>' +
                        '<input id="location_checkbox" type="checkbox" ' + checkboxParameters.location +
                            ' style="display:inline;width:12px;">' +
                        _.escape(location) +
                    '</div>' +
                    '<div>' +
                        '<input id="launchAltitude_checkbox" type="checkbox" ' + checkboxParameters.launchAltitude +
                            ' style="display:inline;width:12px;">' +
                        _.escape(altitude + ' ' + altitudeUnit) +
                    '</div>' +
                    '<div>' +
                        '<input type="checkbox" style="display:inline;width:12px;" checked disabled>' +
                        _.escape(coordinates) +
                    '</div>' +
                    '<button id="apply_google_data" type="button" class="map-button">Apply</button>' +
                    '<button id="close_map" type="button" class="map-button">Close Map</button>' +
               '</div>';
    },

    applyGoogleData: function(location, elevation, coordinates) {
        console.log('1 - location check-box => ', document.getElementById('location_checkbox'));
        console.log('1 - altitude check-box => ', document.getElementById('launchAltitude_checkbox'));
        // If transferring address
        if (document.getElementById('location_checkbox').checked) {
            this.props.onDataApply('location', location);
        }
        console.log('2 - location check-box => ', document.getElementById('location_checkbox'));
        console.log('2 - altitude check-box => ', document.getElementById('launchAltitude_checkbox'));
        // If transfering elevation
        if (document.getElementById('launchAltitude_checkbox').checked) {
            // Convert elevation into units that user chose in the form
            var altitudeUnit = this.props.altitudeUnit;
            var altitude = parseFloat(elevation);
            var newLaunchAltitude = Altitude.getAltitudeInGivenUnits(altitude, altitudeUnit);
            this.props.onDataApply('launchAltitude', newLaunchAltitude);
        }
        // Coordinates transfers anyway
        this.props.onDataApply('coordinates', coordinates);
        this.props.onMapClose();
    },

    render: function() {
        return (
            <div className='interactive-container'>
                <div className='map_container x-full-screen' ref='map' />
                <div className='dimmer' onClick={ this.props.onMapClose } />
            </div>
        );
    }
});


module.exports = InteractiveMap;
