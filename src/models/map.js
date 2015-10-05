'use strict';

var $ = require('jquery');
var PubSub = require('pubsub-js');
var Util = require('./util');
// var mapsapi = require('google-maps-api')('AIzaSyBz1tSd7GuxPzuUdHxOIA6nDWODomNAE3s');
// mapsapi().then( function( maps ) {
// 	//use the google.maps object as you please
// });

/* global google */

var Map = {
	
	mapOptions: {
		center: { lat: 48.693829, lng: -98.893716 }, // USA
		zoom: 4,
		mapTypeId: google.maps.MapTypeId.TERRAIN,
		// map controls setting
		panControl: false,
		streetViewControl: false,
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.SMALL
		},
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
			position: google.maps.ControlPosition.TOP_RIGHT
		},
		scaleControl: true,
		scaleControlOptions: {
			position: google.maps.ControlPosition.RIGHT_BOTTOM
		},
		overviewMapControl: false
	},
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
	
	createMap: function(htmlContainer, centerCoordinates, zoomLevel) {
		this.map = new google.maps.Map(htmlContainer, this.mapOptions);
		if (centerCoordinates !== undefined || centerCoordinates !== null) {
			this.map.setCenter(centerCoordinates);
		};
		if (zoomLevel !== undefined) {
			this.map.setZoom(zoomLevel);
		};
		this.map.setTilt(0); // Disable 45 degree rotation when fully zoomed in
	},
	
	unmountMap: function() {
		this.clearInfowindows();
		this.clearMarkers();
		this.map = null;
	},
	
	
	
	createMarker: function(markerId, position, draggable) {
		this.siteMarkers[markerId] = new google.maps.Marker({
			position: position,
			map: Map.map,
			draggable: draggable
		});
	},
	
	addMarkerMoveEventListner: function(id) {
		var self = this;
		this.geocoder = new google.maps.Geocoder();
		this.elevator = new google.maps.ElevationService();
		
		google.maps.event.addListener(this.siteMarkers[id], 'drag', function() {
			self.siteInfowindows[id].close();
		});
		google.maps.event.addListener(this.siteMarkers[id], 'dragend', function(e) {
			self.moveMarker(e.latLng, id);
		});
		google.maps.event.addListener(this.map, 'click', function(e) {
			self.moveMarker(e.latLng, id);
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
		var self = this;
		$.each(this.siteMarkers, function(markerId) {
			self.clearMarker(markerId);
		});
	},
	
	
	
	createInfowindow: function(infowindowId, content) {
		this.siteInfowindows[infowindowId] = new google.maps.InfoWindow({
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
		var self = this;
		$.each(this.siteInfowindows, function(infowindowId) {
			self.closeInfowindow(infowindowId);
		});
	},
	
	bindMarkerAndInfowindow: function(id) {
		var self = this;
		// Add marker onclick event
		google.maps.event.addListener(self.siteMarkers[id], 'click', function() {
			self.closeAllInfowindows();
			self.openInfowindow(id); // Open infowindow of the clicked marker
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
		var self = this;
		$.each(this.siteInfowindows, function(infowindowId) {
			self.clearInfowindow(infowindowId);
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
		this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchControl);
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
		google.maps.event.addDomListener(searchButton, 'click', function() {
			Map.searchAddress(markerId);
		});
		// Trigger search event if Enter key is pressed on search bar
		google.maps.event.addDomListener(searchBar, 'keypress', function(e) {
			if (e.keyCode == 13) {
				e.preventDefault();
				Map.searchAddress(markerId);
			};
		});
	},
	
	searchAddress: function(markerId) {
		var address = document.getElementById('search_bar').value;
		this.geocoder.geocode({ 'address': address }, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var position = results[0].geometry.location;
				Map.moveMarker(position, markerId);
			} else {
				console.log('Geocode was not successful for the following reason: ' + status);
			};
		});
	},
	
	getElevation: function(googleMapPosition) {
		var self = this;
		// Create a LocationElevationRequest object using the array's one value
		var positionalRequest = {
			'locations': [ googleMapPosition ]
		};
		// Initiate the location request
		this.elevator.getElevationForLocations(positionalRequest, function(results, status) {
			if (status == google.maps.ElevationStatus.OK) {
				// Retrieve the first result
				if (results[0] && Util.isNumber(results[0].elevation)) {
					self.infowindowContent.elevation = results[0].elevation;
				} else {
					console.log('No elevation data for given position');
					self.infowindowContent.elevation = 0;
				};
			} else {
				console.log('Elevation request failed');
				self.infowindowContent.elevation = 0;
			};
			// Map.changeInfowindowContent();
			PubSub.publish('infowindowContentChanged', self.infowindowContent);
		});
	},
	
	getAdress: function(googleMapPosition) {
		var self = this;
		// Create a LocationAddressRequest object
		var positionalRequest = {
			'location': googleMapPosition
		};
		this.geocoder.geocode(positionalRequest, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				// Retrieve the second result (less detailed compare to the first one)
				if (results[1]) {
					self.infowindowContent.address = self.formateGeacoderAddress(results[0].address_components);
				} else {
					console.log('No address for given position');
					self.infowindowContent.address = '';
				};
			} else {
				console.log('Address request failed');
				self.infowindowContent.address = '';
			};
			PubSub.publish('infowindowContentChanged', self.infowindowContent);
		});
	},
	
	getCoordinates: function(position) {
		var lat, lng;
		// Chech the position formate
		if (position.lat instanceof Function &&
			position.lng instanceof Function)
		{
			// formate returned by map onclick event
			lat = position.lat();
			lng = position.lng();
		} else {
			// simple formate { lat: 34.4545454, lng: -120.564523 }
			lat = position.lat;
			lng = position.lng;
		};
		// round to 6 digits after floating point
		var lat = Math.round(lat * 1000000) / 1000000;
		var lng = Math.round(lng * 1000000) / 1000000;
		this.infowindowContent.coordinates = lat + ' ' + lng;
		PubSub.publish('infowindowContentChanged', this.infowindowContent);
	},
	
	// Examples of formated address:
	// 		"Fraser Valey, BC, Canada"
	// 		"Scagit Country, WA, United States"
	// Example of geocoderAddressComponents:
	// [
	//	 {
	//		 "long_name" : "Upper Sumas Mountain Road",
	//		 "short_name" : "Upper Sumas Mountain Rd",
	//		 "types" : [ "route" ]
	//	 },
	// 	{
	//		 "long_name" : "Abbotsford",
	//		 "short_name" : "Abbotsford",
	//		 "types" : [ "locality", "political" ]
	// 	}
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
		for (var i = 0; i < addressElements.length; i++) {
			for (var j = 0; j < geocoderAddressComponents.length; j++) {
				if (geocoderAddressComponents[j].types.indexOf(addressElements[i].googleKey) != -1) {
					addressElements[i].value = geocoderAddressComponents[j][addressElements[i].valueType];
					break;
				};
			};
		};
		
		var addressArray = [];
		var formattedAddress = '';
		// Formate values into array
		for (i = 0; i < addressElements.length; i++) {
			if (addressElements[i].value !== null) {
				addressArray.push(addressElements[i].value);
			};
		};
		// Formate values into string
		for (i = 0; i < addressArray.length; i++) {
			formattedAddress += addressArray[i];
			if (i != (addressArray.length - 1)) {
				formattedAddress += ', ';
			};
		};
		return formattedAddress;
	}
};


module.exports = Map;




