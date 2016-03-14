'use strict';

var _ = require('lodash');
var Promise = require('es6-promise').Promise;
var Util = require('./util');

const CENTER = require('../constants/map-constants').CENTER;
const INFOWINDOW_WIDTH = require('../constants/map-constants').INFOWINDOW_WIDTH;
const UNKNOWN_ADDRESS = require('../constants/map-constants').UNKNOWN_ADDRESS;
const UNKNOWN_ELEVATION = require('../constants/map-constants').UNKNOWN_ELEVATION;

// Load google maps api
// On success extend basic Map object with map interactive functionality
// Emit event that map was loaded
var googleMapsApi = require('google-maps-api')('AIzaSyBz1tSd7GuxPzuUdHxOIA6nDWODomNAE3s');
var mapsApiPromise = googleMapsApi();


var MapFacade = function(mapsApi) {

    this.mapsApi = mapsApi;
    this.map = null;
    this.elevator = null;
    this.geocoder = null;
    this.siteMarkers = {};
    this.siteInfowindows = {};
    this.infowindowOnClickFunctions = {};

    this.mapOptions = {
        center: CENTER.world,
        zoom: 4,
        mapTypeId: mapsApi.MapTypeId.TERRAIN,
        // map controls setting
        panControl: false,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
            style: mapsApi.ZoomControlStyle.SMALL,
            position: mapsApi.ControlPosition.LEFT_TOP
        },
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: mapsApi.MapTypeControlStyle.DROPDOWN_MENU,
            position: mapsApi.ControlPosition.TOP_RIGHT
        },
        scaleControl: true,
        scaleControlOptions: {
            position: mapsApi.ControlPosition.RIGHT_BOTTOM
        },
        overviewMapControl: false
    };
};


MapFacade.prototype.createMap = function(htmlContainer, centerCoordinates, zoomLevel) {
    this.map = new this.mapsApi.Map(htmlContainer, this.mapOptions);
    
    if (centerCoordinates) {
        this.map.setCenter(centerCoordinates);
    }
    if (zoomLevel) {
        this.map.setZoom(zoomLevel);
    }
    this.map.setTilt(0); // Disable 45 degree rotation when fully zoomed in
};



MapFacade.prototype.createMarker = function(siteId, position, draggable = false, changeInfowindowContent) {
    this.siteMarkers[siteId] = new this.mapsApi.Marker({
        position: position,
        map: this.map,
        draggable: draggable
    });
    
    if (draggable) {
        this.addMarkerMoveEventListener(siteId, changeInfowindowContent);
    }
};

MapFacade.prototype.addMarkerMoveEventListener = function(siteId, changeInfowindowContent) {
    this.geocoder = new this.mapsApi.Geocoder();
    this.elevator = new this.mapsApi.ElevationService();

    this.mapsApi.event.addListener(this.siteMarkers[siteId], 'drag', () => {
        this.siteInfowindows[siteId].close();
    });
    this.mapsApi.event.addListener(this.siteMarkers[siteId], 'dragend', (e) => {
        this.moveMarker(e.latLng, siteId, changeInfowindowContent);
    });
    this.mapsApi.event.addListener(this.map, 'click', (e) => {
        this.moveMarker(e.latLng, siteId, changeInfowindowContent);
    });
};

MapFacade.prototype.moveMarker = function(latLng, siteId, changeInfowindowContent) {
    this.siteInfowindows[siteId].close();
    this.siteMarkers[siteId].setPosition(latLng);
    this.map.panTo(latLng);

    // Request position data for infowindow content update
    this
        .getPositionInfoPromise(latLng)
        .then((positionInfo) => {
            changeInfowindowContent(positionInfo, this);
        });
};



MapFacade.prototype.createInfowindow = function(siteId, content, onClickFunc) {
    this.siteInfowindows[siteId] = new this.mapsApi.InfoWindow({
        content: content,
        maxWidth: INFOWINDOW_WIDTH
    });
    
    if (onClickFunc) {
        this.infowindowOnClickFunctions[siteId] = onClickFunc;
    }
};

MapFacade.prototype.setInfowindowContent = function(siteId, content) {
    this.siteInfowindows[siteId].setContent(content);
};

MapFacade.prototype.openInfowindow = function(siteId) {
    this.siteInfowindows[siteId].open(this.map, this.siteMarkers[siteId]);
    
    if (this.infowindowOnClickFunctions[siteId]) {
        document.getElementById('site-' + siteId).addEventListener('click', () => {
            this.infowindowOnClickFunctions[siteId]();
        });
    }
};

MapFacade.prototype.closeInfowindow = function(siteId) {
    this.siteInfowindows[siteId].close();
};

MapFacade.prototype.closeAllInfowindows = function() {
    _.each(this.siteInfowindows, (infowindow, infowindowId) => {
        this.closeInfowindow(infowindowId);
    });
};

MapFacade.prototype.bindMarkerAndInfowindow = function(siteId) {
    // Add marker onclick event
    this.mapsApi.event.addListener(this.siteMarkers[siteId], 'click', () => {
        this.closeAllInfowindows();
        this.openInfowindow(siteId);
    });
};



MapFacade.prototype.addSearchBarControl = function(siteId) {
    // Create control element
    var searchControl = document.createElement('div');
    this.createSearchControl(searchControl, siteId);
    // Add element to google map controls
    this.map.controls[this.mapsApi.ControlPosition.TOP_CENTER].push(searchControl);
};

MapFacade.prototype.createSearchControl = function(containerDiv, siteId) {
    // Set CSS for the search control container
    containerDiv.className = 'search-control';

    // Set CSS for the search bar
    var searchBar = document.createElement('input');
    searchBar.setAttribute('id', 'search-bar');
    searchBar.setAttribute('type', 'textbox');
    searchBar.className = 'search-bar';
    searchBar.placeholder = 'type here or drop a pin';
    containerDiv.appendChild(searchBar);

    // Set CSS for the search button
    var searchButton = document.createElement('div');
    searchButton.setAttribute('id', 'search_button');
    searchButton.className = 'search-button';
    searchButton.textContent = 'Search';
    containerDiv.appendChild(searchButton);

    // Add search event to search button
    this.mapsApi.event.addDomListener(searchButton, 'click', () => {
        this.searchAddress(siteId);
    });
    // Trigger search event if Enter key is pressed on search bar
    this.mapsApi.event.addDomListener(searchBar, 'keypress', (e) => {
        if (e.keyCode == 13) {
            e.preventDefault();
            this.searchAddress(siteId);
        }
    });
};

MapFacade.prototype.searchAddress = function(siteId) {
    var address = document.getElementById('search-bar').value;
    
    this.geocoder.geocode({ 'address': address }, (results, status) => {
        if (status == this.mapsApi.GeocoderStatus.OK) {
            var position = results[0].geometry.location;
            this.moveMarker(position, siteId);
        } else {
            console.log('Geocode was not successful for the following reason: ' + status);
        }
    });
};



MapFacade.prototype.getPositionInfoPromise = function(latLng) {
    return Promise
        .all([
            this.getAddressPromise(latLng),
            this.getElevationPromise(latLng)
        ])
        .then((positionInfoElements) => {
            return {
                address: this.formatGeacoderAddress(positionInfoElements[0]),
                elevation: positionInfoElements[1],
                coordinates: this.getCoordinatesString(latLng)
            };
        });
};


MapFacade.prototype.getAddressPromise = function(latLng) {
    // Create a LocationAddressRequest object
    var positionalRequest = {
        'location': latLng
    };
    
    return new Promise((resolve) => {
        // Initiate the location request
        this.geocoder.geocode(positionalRequest, (results, status) => {
            if (status == this.mapsApi.GeocoderStatus.OK) {
                // Retrieve the second result (less detailed compare to the first one)
                if (results[1]) {
                    resolve(results[1].address_components);
                }
            }
            resolve(UNKNOWN_ADDRESS);
        });
    });
};

MapFacade.prototype.getElevationPromise = function(latLng) {
    // Create a LocationElevationRequest object using the array's one value
    var positionalRequest = {
        'locations': [ latLng ]
    };
    
    return new Promise((resolve) => {
        // Initiate the location request
        this.elevator.getElevationForLocations(positionalRequest, (results, status) => {
            if (status == this.mapsApi.ElevationStatus.OK) {
                // Retrieve the first result
                if (results[0] && Util.isNumber(results[0].elevation)) {
                    resolve(results[0].elevation);
                }
            }
            resolve(UNKNOWN_ELEVATION);
        });
    });
};


MapFacade.prototype.getCoordinatesString = function(latLng) {
    var lat, lng;
    
    // Check the position format
    if (latLng.lat instanceof Function &&
        latLng.lng instanceof Function
    ) {
        // format returned by map onclick event
        lat = latLng.lat();
        lng = latLng.lng();
    } else {
        // simple format { lat: 34.4545454, lng: -120.564523 }
        lat = latLng.lat;
        lng = latLng.lng;
    }
    
    // round to 6 digits after floating point
    lat = Math.round(lat * 1000000) / 1000000;
    lng = Math.round(lng * 1000000) / 1000000;
    
    return lat + ' ' + lng;
};

// Examples of formated address:
//         "Fraser Valey, BC, Canada"
//         "Scagit Country, WA, United States"

// Example of geocoderResult:
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
MapFacade.prototype.formatGeacoderAddress = function(geocoderResult) {
    var i, j;
    var addressList = [];
    var addressElements = [
        { // e.g. region
            googleKey: 'administrative_area_level_2', // maybe change it to 'locality'
            valueType: 'long_name'
        },
        { // e.g. state, province
            googleKey: 'administrative_area_level_1',
            valueType: 'short_name'
        },
        {
            googleKey: 'country',
            valueType: 'long_name'
        }
    ];

    // Pull needed values from geocoder result
    for (i = 0; i < addressElements.length; i++) {
        for (j = 0; j < geocoderResult.length; j++) {
            if (geocoderResult[j].types.indexOf(addressElements[i].googleKey) != -1) {
                addressList.push(geocoderResult[j][addressElements[i].valueType]);
                break;
            }
        }
    }

    return addressList.join(', ');
};



MapFacade.createPromise = function() {
    return mapsApiPromise.then((mapsApi) => {
        return new MapFacade(mapsApi);
    });
};


module.exports = MapFacade;
