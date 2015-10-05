'use strict';

var $ = require('jquery');
var PubSub = require('pubsub-js');
var SiteModel = require('./site');
var GliderModel = require('./glider');
var PilotModel = require('./pilot');
var Util = require('./util');


var FlightModelConstructor = function() {
	this.flights = {
		34: {
			id: 34,
			date: '2015-05-13',
			siteId: null, // default null
			altitude: 670.56,
			airtime: 14,
			gliderId: 2, // default null
			remarks: 'slide down',
			creationDateTime: '2015-02-09 09:09:00'
		},
		78: {
			id: 78,
			date: '2015-05-13',
			siteId: 25,
			altitude: 1859.28,
			airtime: 34,
			gliderId: 2,
			remarks: 'first flight at Pemberton, thermal soaring',
			creationDateTime: '2015-02-09 12:48:00'
		},
		93: {
			id: 93,
			date: '2015-05-01',
			siteId: 25,
			altitude: 1249.68,
			airtime: 14,
			gliderId: 1,
			remarks: 'ground suck',
			creationDateTime: '2015-02-03 12:48:00'
		},
		12: {
			id: 12,
			date: '2015-05-10',
			siteId: 24,
			altitude: 2834.64,
			airtime: 94,
			gliderId: 1,
			remarks: 'Awesome flight: strong thermals, white snow caps and eagles!',
			creationDateTime: '2015-02-04 12:48:00'
		}
	};
		
	this.formValidationConfig = {
		date: {
			method: 'dateFormat',
			rules: {
				field: 'Date'
			}
		},
		siteId: {
			method: 'selectOption',
			rules: {
				getArrayOfOptions: function() { return SiteModel.getSiteIdsList(); },
				defaultVal: null,
				field: 'Site'
			}
		},
		altitude: {
			method: 'number',
			rules: {
				min: 0,
				defaultVal: 0,
				field: 'Altitude'
			}
		},
		airtime: {
			method: 'number',
			rules: {
				min: 0,
				round: true,
				defaultVal: 0,
				field: 'Airtime'
			}
		},
		hours: {
			method: 'number',
			rules: {
				min: 0,
				round: true,
				defaultVal: 0,
				field: 'Airtime'
			}
		},
		minutes: {
			method: 'number',
			rules: {
				min: 0,
				round: true,
				defaultVal: 0,
				field: 'Airtime'
			}
		},
		gliderId: {
			method: 'selectOption',
			rules: {
				getArrayOfOptions: function() { return GliderModel.getGliderIdsList(); },
				defaultVal: null,
				field: 'Glider'
			}
		},
		remarks: {
			method: 'text',
			rules: {
				defaultVal: '',
				field: 'Remarks'
			}
		},
		altitudeUnits: {
			method: 'selectOption',
			rules: {
				getArrayOfOptions: function() { return PilotModel.getAltitudeUnitsList(); },
				field: 'Altitude Units'
			}
		}
	};
	
	this.getFlightsArray = function() {
		var flightOutputs = [];
		var self = this;
		// For each flight
		$.each(this.flights, function(flightId) {
			flightOutputs.push(self.getFlightOutput(flightId));
		});
		return flightOutputs;
	};
	
	this.getFlightOutput = function(id) {
		if (id === null ||
			id === undefined ||
			this.flights[id] === undefined)
		{
			return null;
		};
		// If site is not defined for this flight show '-' to user instead
		var siteName = '';
		// If site is defined
		if (this.flights[id].siteId !== null) {
			// Find site name to show to user
			siteName = SiteModel.getSiteNameById(this.flights[id].siteId);
		};
		// The same with glider
		var gliderName = '';
		if (this.flights[id].gliderId !== null) {
			var gliderName = GliderModel.getGliderNameById(this.flights[id].gliderId);
		};

		
		var altitude = PilotModel.getAltitudeInPilotUnits(this.flights[id].altitude);
		var altitudeUnits = PilotModel.getAltitudeUnits();
		var altitudeAboveLaunch = this.getAltitudeAboveLaunches(this.flights[id].siteId, this.flights[id].altitude);
		return {
			id: this.flights[id].id,
			date: this.flights[id].date,
			siteId: this.flights[id].siteId, // ??? last added site or first site in alphabetic order !!! null if no sites yet
			siteName: siteName,
			altitude: altitude,
			altitudeUnits: altitudeUnits,
			altitudeAboveLaunch: altitudeAboveLaunch,
			airtime: this.flights[id].airtime,
			gliderId: this.flights[id].gliderId, // ??? last added glider or first glider in alphabetic order !!! null if no sites yet
			gliderName: gliderName,
			remarks: this.flights[id].remarks
		};
	};
	
	this.getNewFlightOutput = function() {
		var lastFlight = this.getLastFlight();
		return {
			date: Util.today(),
			siteId: lastFlight.siteId, // null if no sites yet otherwise last added site id
			altitude: 0,
			altitudeUnits: PilotModel.getAltitudeUnits(),
			airtime: 0,
			gliderId: lastFlight.gliderId, // null if no sites yet otherwise last added glider id
			remarks: ''
		};
	};
	
	this.getLastFlight = function() {
		var noFlightsYet = true;
		var lastFlight = {};
		lastFlight.date = '1900-01-01'; // date to start from
		lastFlight.creationDateTime = '1900-01-01 00:00:00';

		$.each(this.flights, function(flightId, flight) {
			// Find the most recent date
			if (lastFlight.date < flight.date) {
				// Save this flight
				lastFlight = flight;
				// And Hurey, we have a flight record
				noFlightsYet = false;
			// If two flights was in the same day
			} else if (lastFlight.date === flight.date &&
					   lastFlight.creationDateTime < flight.creationDateTime) {
				// Take the last created
				lastFlight = flight;
				noFlightsYet = false;
			};
		});
		
		if (noFlightsYet) {
			// Take dafault flight properties
			lastFlight = {
				siteId: SiteModel.getLastAddedId(), // null if no data has been added yet
				gliderId: GliderModel.getLastAddedId() // null if no data has been added yet
			};
		};
		return lastFlight;
	};
	
	this.saveFlight = function(newFlight) {
		newFlight = this.setFlightInput(newFlight);
		this.flights[newFlight.id] = newFlight;
	};
	
	this.setFlightInput = function(newFlight) {
		// Set default values to empty fields
		newFlight = this.setDefaultValues(newFlight);
		
		var oldAltitude = 0;
		var newAltitude = newFlight.altitude;
		var units = newFlight.altitudeUnits;
		// Create a temporary id for new flight
		if (newFlight.id === undefined) {
			newFlight.id = 'tempId' + Date.now(); // change id after server saving !!!
		// If editing existing flight
		} else {
			// Save old altitude value in order to compare to
			oldAltitude = this.flights[newFlight.id].altitude;
		};
		newFlight.altitude = PilotModel.getAltitudeInMeters(newAltitude, oldAltitude, units);
		newFlight.creationDateTime = Util.today() + ' ' + Util.timeNow();
		return newFlight;
	};
	
	this.setDefaultValues = function(newFlight) {
		$.each(this.formValidationConfig, function(fieldName, config) {
			// If there is default value for the field which val is null or undefined or ''
			if ((newFlight[fieldName] === null || (newFlight[fieldName] + '').trim() === '') &&
				 config.rules.defaultVal !== undefined)
			{
				// Set it to its default value
				newFlight[fieldName] = config.rules.defaultVal;
			};
		});
		return newFlight;
	};
	
	this.deleteFlight = function(id) {
		delete this.flights[id];
	};
	
	// Expected eventData: { siteId: siteId }
	this.clearSiteId = function(eventName, eventData) {
		$.each(this.flights, function(flightId, flight) {
			if (flight.siteId == eventData.siteId) {
				flight.siteId = null;
			};
		});
	};
	
	// Expected eventData: { gliderId: gliderId }
	this.clearGliderId = function(eventName, eventData) {
		$.each(this.flights, function(flightId, flight) {
			if (flight.gliderId == eventData.gliderId) {
				flight.gliderId = null;
			};
		});
	};

	/**
	 * Gets altitude above launch
	 * @param {number|null} siteId
	 * @param {number} flightAltitude
	 * @returns {number} altitude above launch
     */
	this.getAltitudeAboveLaunches = function(siteId, flightAltitude) {
		var siteAltitude = 0;
		if (siteId !== null) {
			siteAltitude = SiteModel.getLaunchAltitudeById(siteId);
		};
		var altitudeDiff = parseFloat(flightAltitude) - parseFloat(siteAltitude);
		return PilotModel.getAltitudeInPilotUnits(altitudeDiff);
	};
	
	this.getLastFlightDate = function() {
		var lastFlight = this.getLastFlight();
		if (lastFlight.date === undefined) {
			return null;
		};
		return lastFlight.date;
	};
	
	this.getNumberOfFlights = function() {
		return Object.keys(this.flights).length;
	};
	
	this.getNumberOfFlightsOnGlider = function(gliderId) {
		var numberOfFlights = 0;
		$.each(this.flights, function(flightId, flight) {
			if (flight.gliderId == gliderId) {
				numberOfFlights++;
			};
		});
		return numberOfFlights;
	};
	
	this.getNumberOfVisitedSites = function() {
		var sitesVisited = [];
		$.each(this.flights, function(flightId, flight) {
			if (flight.siteId !== null &&
				sitesVisited.indexOf(flight.siteId) === -1)
			{
				sitesVisited.push(flight.siteId);
			}
		});
		return sitesVisited.length;
	};
	
	this.getTotalAirtime = function() {
		var airtime = 0;
		$.each(this.flights, function(flightId, flight) {
			airtime += parseInt(flight.airtime);
		});
		return airtime;
	};
	
	this.getGliderAirtime = function(gliderId) {
		var gliderAirtime = 0;
		$.each(this.flights, function(flightId, flight) {
			if (flight.gliderId == gliderId) {
				gliderAirtime += parseFloat(flight.airtime);
			}
		});
		return gliderAirtime;
	};
	
	this.getValidationConfig = function() {
		return this.formValidationConfig;
	};
	
	
	PubSub.subscribe('delete.site', this.clearSiteId.bind(this));
	PubSub.subscribe('delete.glider', this.clearGliderId.bind(this));
};

FlightModelConstructor.prototype = Object.create(Object.prototype);
FlightModelConstructor.prototype.constructor = FlightModelConstructor;
var FlightModel = new FlightModelConstructor();


module.exports = FlightModel;





