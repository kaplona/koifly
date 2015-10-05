'use strict';

var $ = require('jquery');
var GliderModel = require('./glider');


var PilotModel = {
	pilot: {
		id: 3567,
		userName: 'Kaplun',
		password: 1111,
		initialFlightNum: 10,
		initialAirtime: 40,
		altitudeUnits: 'feet'
	},
	
	formValidationConfig: {
		initialFlightNum: {
			method: 'number',
			rules: {
				min: 0,
				round: true,
				defaultVal: 0,
				field: 'Initial Flight #'
			}
		},
		initialAirtime: {
			method: 'number',
			rules: {
				min: 0,
				round: true,
				defaultVal: 0,
				field: 'Initial Airtime'
			}
		},
		altitudeUnits: {
			method: 'selectOption',
			rules: {
				getArrayOfOptions: function() { return PilotModel.getAltitudeUnitsList(); },
				field: 'Glider'
			}
		},
		hours:  {
			method: 'number',
			rules: {
				min: 0,
				round: true,
				defaultVal: 0,
				field: 'Initial Airtime'
			}
		},
		minutes: {
			method: 'number',
			rules: {
				min: 0,
				round: true,
				defaultVal: 0,
				field: 'Initial Airtime'
			}
		}
	},
	
	meterConverter: {
		meter: 1,
		feet: 3.28084
	},
	
	getPilotOutput: function() {
		var FlightModel = require('./flight');
		var flightNumTotal = this.pilot.initialFlightNum + FlightModel.getNumberOfFlights();
		var airtimeTotal = this.pilot.initialAirtime + FlightModel.getTotalAirtime();
		
		return {
			userName: this.pilot.userName,
			flightNumTotal: flightNumTotal,
			airtimeTotal: airtimeTotal,
			siteNum: FlightModel.getNumberOfVisitedSites(),
			gliderNum: GliderModel.getNumberOfGliders()
		};
	},
	
	getPilotEditOutput: function() {
		return {
			userName: this.pilot.userName,
			initialFlightNum: this.pilot.initialFlightNum,
			initialAirtime: this.pilot.initialAirtime,
			altitudeUnits: this.pilot.altitudeUnits
		};
	},
	
	savePilotInfo: function(newPilotInfo) {
		// Set default values to empty fields
		newPilotInfo = this.setDefaultValues(newPilotInfo);
		
		this.pilot.initialFlightNum = parseInt(newPilotInfo.initialFlightNum);
		this.pilot.initialAirtime = parseInt(newPilotInfo.initialAirtime);
		this.pilot.altitudeUnits = newPilotInfo.altitudeUnits;
	},
	
	setDefaultValues: function(newPilotInfo) {
		$.each(this.formValidationConfig, function(fieldName, config) {
			// If there is default value for the field which val is null or undefined or ''
			if ((newPilotInfo[fieldName] === null || (newPilotInfo[fieldName] + '').trim() === '') &&
				 config.rules.defaultVal !== undefined)
			{
				// Set it to its default value
				newPilotInfo[fieldName] = config.rules.defaultVal;
			};
		});
		return newPilotInfo;
	},
	
	getAltitudeUnits: function() {
		return this.pilot.altitudeUnits;
	},
	
	// altitude in meters
	getAltitudeInPilotUnits: function(altitude) {
		var increment = this.meterConverter[this.pilot.altitudeUnits];
		return Math.round(parseFloat(altitude) * increment);
	},
	
	// altitude in meters
	getAltitudeInGivenUnits: function(altitude, units) {
		var increment = this.meterConverter[units];
		return Math.round(parseFloat(altitude) * increment);
	},
	
	getAltitudeInMeters: function(val, oldVal, units) {
		var oldFilteredVal = this.getAltitudeInPilotUnits(oldVal);
		// If user changed the value or measurement units
		if (val != oldFilteredVal || units != this.pilot.altitudeUnits) {
			// Use the new val
			return parseFloat(val) / this.meterConverter[units];
		// If no changes - keep the old value
		// * We need to keep exact the same value in meters in DB
		// * in order to get the same value in feet all the times
		} else {
			return oldVal;
		};
	},
	
	getAltitudeUnitsList: function() {
		return Object.keys(this.meterConverter);
	},
	
	getValidationConfig: function() {
		return this.formValidationConfig;
	}
};


module.exports = PilotModel;


