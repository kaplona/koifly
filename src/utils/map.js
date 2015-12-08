'use strict';

var _ = require('lodash');
var PubSub = require('./pubsub');
var Util = require('./util');

var Map = {
    map: null,
    elevator: null,
    geocoder: null,
    siteMarkers: {},
    siteInfowindows: {},
    infowindowWidth: 150,
    infowindowContent: {},
    outOfMapCoordinates: { lat: 90, lng: 0 },
    zoomLevel: {
        world: 4,
        region: 7,
        site: 10
    },
    center: {
        world: { lat: 48.693829, lng: -98.893716 }, // USA
        region: { lat: 49.2827291, lng: -123.1207375 } // Vancouver
    },
    isLoaded: false
};


// Load google maps api
// On success extend basic Map object with map interactive functionality
// Emit event that map was loaded
var mapsapi = require('google-maps-api')('AIzaSyBz1tSd7GuxPzuUdHxOIA6nDWODomNAE3s');
mapsapi().then((maps) => {
    // maps is the google.maps object
    _.extend(Map, {

        isLoaded: true,

        mapOptions: {
            center: { lat: 48.693829, lng: -98.893716 }, // USA
            zoom: 4,
            mapTypeId: maps.MapTypeId.TERRAIN,
            // map controls setting
            panControl: false,
            streetViewControl: false,
            zoomControl: true,
            zoomControlOptions: {
                style: maps.ZoomControlStyle.SMALL
            },
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: maps.MapTypeControlStyle.DROPDOWN_MENU,
                position: maps.ControlPosition.TOP_RIGHT
            },
            scaleControl: true,
            scaleControlOptions: {
                position: maps.ControlPosition.RIGHT_BOTTOM
            },
            overviewMapControl: false
        },

        createMap: function(htmlContainer, centerCoordinates, zoomLevel) {
            this.map = new maps.Map(htmlContainer, this.mapOptions);
            if (centerCoordinates !== undefined || centerCoordinates !== null) {
                this.map.setCenter(centerCoordinates);
            }
            if (zoomLevel !== undefined) {
                this.map.setZoom(zoomLevel);
            }
            this.map.setTilt(0); // Disable 45 degree rotation when fully zoomed in
        },

        unmountMap: function() {
            this.clearInfowindows();
            this.clearMarkers();
            this.map = null;
        },



        createMarker: function(markerId, position, draggable) {
            this.siteMarkers[markerId] = new maps.Marker({
                position: position,
                map: Map.map,
                draggable: draggable
            });
        },

        addMarkerMoveEventListner: function(id) {
            this.geocoder = new maps.Geocoder();
            this.elevator = new maps.ElevationService();

            maps.event.addListener(this.siteMarkers[id], 'drag', () => {
                this.siteInfowindows[id].close();
            });
            maps.event.addListener(this.siteMarkers[id], 'dragend', (e) => {
                this.moveMarker(e.latLng, id);
            });
            maps.event.addListener(this.map, 'click', (e) => {
                this.moveMarker(e.latLng, id);
            });

            this.addSearchBarControl(id);
        },

        moveMarker: function(googleMapPosition, id) {
            this.siteInfowindows[id].close();
            this.siteMarkers[id].setPosition(googleMapPosition);
            this.map.panTo(googleMapPosition);
            // Request position data for futher infowindow content update
            this.requestPositionInfo(googleMapPosition);
        },

        clearMarker: function(markerId) {
            this.siteMarkers[markerId].setMap(null); // Remove marker from the map
            this.siteMarkers[markerId] = null; // Remove marker it-self
            delete this.siteMarkers[markerId]; // Delete marker reference from markers list
        },

        clearMarkers: function() {
            _.each(this.siteMarkers, (marker, markerId) => {
                this.clearMarker(markerId);
            });
        },



        createInfowindow: function(infowindowId, content) {
            this.siteInfowindows[infowindowId] = new maps.InfoWindow({
                content: content,
                maxWidth: Map.infowindowWidth
            });
        },

        setInfowindowContent: function(infowindowId, content) {
            this.siteInfowindows[infowindowId].setContent(content);
        },

        openInfowindow: function(id) {
            this.siteInfowindows[id].open(this.map, this.siteMarkers[id]);
        },

        closeInfowindow: function(id) {
            this.siteInfowindows[id].close();
        },

        closeAllInfowindows: function() {
            _.each(this.siteInfowindows, (infowindow, infowindowId) => {
                this.closeInfowindow(infowindowId);
            });
        },

        bindMarkerAndInfowindow: function(id) {
            // Add marker onclick event
            maps.event.addListener(this.siteMarkers[id], 'click', () => {
                this.closeAllInfowindows();
                this.openInfowindow(id); // Open infowindow of the clicked marker
            });
        },

        clearInfowindowContent: function() {
            this.infowindowContent = {};
        },

        clearInfowindow: function(infowindowId) {
            this.closeInfowindow(infowindowId); // Close infowindow
            this.siteInfowindows[infowindowId] = null; // Remove infowindow it-self
            delete this.siteInfowindows[infowindowId]; // Delete infowindow reference from infowindows list
        },

        clearInfowindows: function() {
            _.each(this.siteInfowindows, (infowindow, infowindowId) => {
                this.clearInfowindow(infowindowId);
            });
        },

        requestPositionInfo: function(googleMapPosition) {
            this.clearInfowindowContent();
            this.getAdress(googleMapPosition);
            this.getElevation(googleMapPosition);
            this.getCoordinates(googleMapPosition);
        },

        addSearchBarControl: function(markerId) {
            // Create control element
            var searchControl = document.createElement('div');
            this.createSearchControl(searchControl, markerId);
            // Add element to google map controls
            this.map.controls[maps.ControlPosition.TOP_CENTER].push(searchControl);
        },

        createSearchControl: function(containerDiv, markerId) {
            // Set CSS for the search bar
            var searchBar = document.createElement('input');
            searchBar.setAttribute('id', 'search_bar');
            searchBar.setAttribute('type', 'textbox');
            searchBar.style.width = '200px';
            searchBar.style.display = 'inline';
            containerDiv.appendChild(searchBar);

            // Set CSS for the search button
            var searchButton = document.createElement('input');
            searchButton.setAttribute('id', 'search_button');
            searchButton.setAttribute('type', 'button');
            searchButton.style.display = 'inline';
            searchButton.value = 'Search';
            containerDiv.appendChild(searchButton);

            // Add search event to search button
            maps.event.addDomListener(searchButton, 'click', () => {
                Map.searchAddress(markerId);
            });
            // Trigger search event if Enter key is pressed on search bar
            maps.event.addDomListener(searchBar, 'keypress', (e) => {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    Map.searchAddress(markerId);
                }
            });
        },

        searchAddress: function(markerId) {
            var address = document.getElementById('search_bar').value;
            this.geocoder.geocode({ 'address': address }, (results, status) => {
                if (status == maps.GeocoderStatus.OK) {
                    var position = results[0].geometry.location;
                    Map.moveMarker(position, markerId);
                } else {
                    console.log('Geocode was not successful for the following reason: ' + status);
                }
            });
        },

        getElevation: function(googleMapPosition) {
            // Create a LocationElevationRequest object using the array's one value
            var positionalRequest = {
                'locations': [ googleMapPosition ]
            };
            // Initiate the location request
            this.elevator.getElevationForLocations(positionalRequest, (results, status) => {
                if (status == maps.ElevationStatus.OK) {
                    // Retrieve the first result
                    if (results[0] && Util.isNumber(results[0].elevation)) {
                        this.infowindowContent.elevation = results[0].elevation;
                    } else {
                        console.log('No elevation data for given position');
                        this.infowindowContent.elevation = 'unknown elevation';
                    }
                } else {
                    console.log('Elevation request failed');
                    this.infowindowContent.elevation = 'unknown elevation';
                }
                PubSub.emit('infowindowContentChanged', this.infowindowContent);
            });
        },

        getAdress: function(googleMapPosition) {
            // Create a LocationAddressRequest object
            var positionalRequest = {
                'location': googleMapPosition
            };
            this.geocoder.geocode(positionalRequest, (results, status) => {
                if (status == maps.GeocoderStatus.OK) {
                    // Retrieve the second result (less detailed compare to the first one)
                    if (results[1]) {
                        this.infowindowContent.address = this.formateGeacoderAddress(results[0].address_components);
                    } else {
                        console.log('No address for given position');
                        this.infowindowContent.address = 'unknown address';
                    }
                } else {
                    console.log('Address request failed');
                    this.infowindowContent.address = 'unknown address';
                }
                PubSub.emit('infowindowContentChanged', this.infowindowContent);
            });
        },

        getCoordinates: function(position) {
            var lat, lng;
            // Chech the position formate
            if (position.lat instanceof Function &&
                position.lng instanceof Function
            ) {
                // formate returned by map onclick event
                lat = position.lat();
                lng = position.lng();
            } else {
                // simple formate { lat: 34.4545454, lng: -120.564523 }
                lat = position.lat;
                lng = position.lng;
            }
            // round to 6 digits after floating point
            lat = Math.round(lat * 1000000) / 1000000;
            lng = Math.round(lng * 1000000) / 1000000;
            this.infowindowContent.coordinates = lat + ' ' + lng;
            PubSub.emit('infowindowContentChanged', this.infowindowContent);
        },

        // Examples of formated address:
        //         "Fraser Valey, BC, Canada"
        //         "Scagit Country, WA, United States"
        // Example of geocoderAddressComponents:
        // [
        //     {
        //         "long_name" : "Upper Sumas Mountain Road",
        //         "short_name" : "Upper Sumas Mountain Rd",
        //         "types" : [ "route" ]
        //     },
        //     {
        //         "long_name" : "Abbotsford",
        //         "short_name" : "Abbotsford",
        //         "types" : [ "locality", "political" ]
        //     }
        // ]
        formateGeacoderAddress: function(geocoderAddressComponents) {
            var i, j;
            var addressElements = [
                { // e.g. region
                    googleKey: 'administrative_area_level_2', // !!! maybe cange it to 'locality'
                    valueType: 'long_name',
                    value: null
                },
                { // e.g. state, province
                    googleKey: 'administrative_area_level_1',
                    valueType: 'short_name',
                    value: null
                },
                {
                    googleKey: 'country',
                    valueType: 'long_name',
                    value: null
                }
            ];

            // Pull needed values from geocoder result
            for (i = 0; i < addressElements.length; i++) {
                for (j = 0; j < geocoderAddressComponents.length; j++) {
                    if (geocoderAddressComponents[j].types.indexOf(addressElements[i].googleKey) != -1) {
                        addressElements[i].value = geocoderAddressComponents[j][addressElements[i].valueType];
                        break;
                    }
                }
            }

            var addressArray = [];
            var formattedAddress = '';
            // Formate values into array
            for (i = 0; i < addressElements.length; i++) {
                if (addressElements[i].value !== null) {
                    addressArray.push(addressElements[i].value);
                }
            }
            // Formate values into string
            for (i = 0; i < addressArray.length; i++) {
                formattedAddress += addressArray[i];
                if (i != (addressArray.length - 1)) {
                    formattedAddress += ', ';
                }
            }
            return formattedAddress;
        }
    });

    PubSub.emit('mapLoaded');
});


module.exports = Map;
