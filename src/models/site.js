'use strict';

var $ = require('jquery');
var Util = require('./util');
var PilotModel = require('./pilot');


var SiteModel = {
	sites: {
		23: {
			id: 23,
			name: 'Hope',
			location: 'Hope, BC, Canada',
			coordinates: { lat: 49.368961, lng: -121.495056 },
			launchAltitude: 0,
			creationDateTime: '2015-02-04 12:48:00'
		},
		24: {
			id: 24,
			name: 'Woodside',
			location: 'Agazzis, BC, Canada',
			coordinates: { lat: 49.2445, lng: -121.888504 },
			launchAltitude: 670.56,
			creationDateTime: '2015-05-24 12:48:00'
		},
		25: {
			id: 25,
			name: 'Pemberton',
			location: '',
			coordinates: { lat: 50.369117, lng: -122.78698 },
			launchAltitude: 1249.68,
			creationDateTime: '2015-06-02 12:48:00'
		},
		26: {
			id: 26,
			name: 'Blanchard',
			location: 'Bellingham, WA, US',
			coordinates: { lat: 48.652758, lng: -122.465115 },
			launchAltitude: 548.7,
			creationDateTime: '2015-02-04 14:19:00'
		}
	},
	
	formValidationConfig: {
		name: {
			method: 'unique',
			rules: {
				getDataArray: function() { return SiteModel.getSitesArray(); },
				field: 'Name'
			}
		},
		location: {
			method: 'text',
			rules: {
				defaultVal: '',
				field: 'Location'
			}
		},
		coordinates: {
			method: 'coordinates',
			rules: {
				minLatitude: -90,
				maxLatitude: 90,
				minLongitude: -180,
				maxLongitude: 180,
				defaultVal: null,
				field: 'Coordinates'
			}
		},
		launchAltitude: {
			method: 'number',
			rules: {
				min: 0,
				defaultVal: 0,
				field: 'Launch Altitude'
			}
		},
		altitudeUnits: {
			method: 'selectOption',
			rules: {
				getArrayOfOptions: function() { return PilotModel.getAltitudeUnitsList(); },
				field: 'Altitude Units'
			}
		}
	},
	
	getSitesArray: function() {
		var self = this;
		var siteOutputs = [];
		$.each(this.sites, function(siteId) {
			siteOutputs.push(self.getSiteOutput(siteId));
		});
		return siteOutputs;
	},
	
	getSiteOutput: function(id) {
		if (id === null ||
			id === undefined ||
			this.sites[id] === undefined)
		{
			return null;
		};
		var coordinates = this.formCoordinatesOutput(this.sites[id].coordinates);
		var altitude = PilotModel.getAltitudeInPilotUnits(this.sites[id].launchAltitude);
		var altitudeUnits = PilotModel.getAltitudeUnits();
		
		return {
			id: this.sites[id].id,
			name: this.sites[id].name,
			location: this.sites[id].location,
			launchAltitude: altitude,
			coordinates: coordinates,
			altitudeUnits: altitudeUnits,
			locationSort: this.sites[id].location.toUpperCase()
		};
	},
	
	getNewSiteOutput: function() {
		return {
			name: '',
			location: '',
			coordinates: '', // !!! default local coordinates
			launchAltitude: 0,
			altitudeUnits: PilotModel.getAltitudeUnits()
		};
	},
	
	saveSite: function(newSite) {
		newSite = this.setSiteInput(newSite);
		this.sites[newSite.id] = newSite;
	},
	
	setSiteInput: function(newSite) {
		// Set default values to empty fields
		newSite = this.setDefaultValues(newSite);
		
		var oldAltitude = 0;
		var newAltitude = newSite.launchAltitude;
		var units = newSite.altitudeUnits;
		// If creating a new site
		if (newSite.id === undefined) {
			newSite.id = 'tempId' + Date.now(); // change id after server saving !!!
		// If editing existing site
		} else {
			oldAltitude = this.sites[newSite.id].launchAltitude;
		};
		newSite.launchAltitude = PilotModel.getAltitudeInMeters(newAltitude, oldAltitude, units);
		newSite.coordinates = this.formCoordinatesInput(newSite.coordinates);
		newSite.creationDateTime = Util.today() + ' ' + Util.timeNow();
		return newSite;
	},
	
	setDefaultValues: function(newSite) {
		$.each(this.formValidationConfig, function(fieldName, config) {
			// If there is default value for the field which val is null or undefined or ''
			if ((newSite[fieldName] === null || (newSite[fieldName] + '').trim() === '') &&
				 config.rules.defaultVal !== undefined)
			{
				// Set it to its default value
				newSite[fieldName] = config.rules.defaultVal;
			};
		});
		return newSite;
	},
	
	deleteSite: function(siteId) {
		delete this.sites[siteId];
	},
	
	getLatLngCoordinates: function(siteId) {
		return this.sites[siteId] ? this.sites[siteId].coordinates : null;
	},
	
	formCoordinatesOutput: function(coordinates) {
		var outputString = '';
		if (coordinates !== null) {
			outputString = coordinates.lat + ' ' + coordinates.lng;
		};
		return outputString;
	},
	
	formCoordinatesInput: function(validString) {
		if (validString === null) {
			return validString;
		};
		var validString = validString.replace(/°/g, ' ').trim();
		var latLng = validString.split(/\s*,*[,\s],*\s*/);
		return { lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1]) };
	},
	
	getNumberOfSites: function() {
		return Object.keys(this.sites).length;
	},
	
	getSiteNameById: function(id) {
		return this.sites[id].name;
	},
	
	// Return last added site id or null if no data has been added yet
	getLastAddedId: function() {
		var lastSite = {
			id: null,
			creationDateTime: '1900-01-01 00:00:00'
		};
		$.each(this.sites, function(siteId, site) {
			if (lastSite.creationDateTime < site.creationDateTime) {
				lastSite = site;
			};
		});
		return lastSite.id;
	},
	
	getLaunchAltitudeById: function(id) {
		return this.sites[id].launchAltitude;
	},
	
	getSiteSimpleList: function() {
		var simpleList = {};
		$.each(this.sites, function(siteId, site) {
			simpleList[siteId] = site.name;
		});
		return simpleList;
	},
	
	getSiteIdsList: function() {
		return Object.keys(this.sites);
	},
	
	getValidationConfig: function() {
		return this.formValidationConfig;
	}
};


module.exports = SiteModel;


