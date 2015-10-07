'use strict';

var $ = require('jquery');
var Util = require('./util');


var GliderModel = {
	gliders: {
		1: {
			id: 1,
			name: 'Sport 2',
			initialFlightNum: 4,
			initialAirtime: 90,
			remarks: 'need spare downtube',
			creationDateTime: '2015-08-31 18:12:00'
		},
		2: {
			id: 2,
			name: 'Pulse 9m',
			initialFlightNum: 10,
			initialAirtime: 120,
			remarks: 'need after crash check',
			creationDateTime: '2015-02-20 09:05:00'
		},
		3: {
			id: 3,
			name: 'Falcon 14',
			initialFlightNum: 23,
			initialAirtime: 80,
			remarks: '',
			creationDateTime: '2015-06-04 12:48:00'
		}
	},
	
	formValidationConfig: {
		name: {
			method: 'unique',
			rules: {
				getDataArray: function() { return GliderModel.getGlidersArray(); },
				field: 'Name'
			}
		},
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
		hours: {
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
		},
		remarks: {
			method: 'text',
			rules: {
				defaultVal: '',
				field: 'Remarks'
			}
		}
	},
	
	getGlidersArray: function() {
		var gliderOutputs = [];
		$.each(this.gliders, (gliderId) => gliderOutputs.push(this.getGliderOutput(gliderId)));
		return gliderOutputs;
	},
	
	getGliderOutput: function(id) {
		if (id === null ||
			id === undefined ||
			this.gliders[id] === undefined)
		{
			return null;
		}
		var FlightModel = require('./flight');
		var trueFlightNum = this.gliders[id].initialFlightNum + FlightModel.getNumberOfFlightsOnGlider(id);
		var trueAirtime = this.gliders[id].initialAirtime + FlightModel.getGliderAirtime(id);
		
		return {
			id: this.gliders[id].id,
			name: this.gliders[id].name,
			initialFlightNum: this.gliders[id].initialFlightNum,
			initialAirtime: this.gliders[id].initialAirtime,
			remarks: this.gliders[id].remarks,
			trueFlightNum: trueFlightNum,
			trueAirtime: trueAirtime
		};
	},
	
	getNewGliderOutput: function() {
		return {
			name: '',
			initialFlightNum: 0,
			initialAirtime: 0,
			remarks: ''
		};
	},
	
	saveGlider: function(newGlider) {
		newGlider = this.setGliderInput(newGlider);
		this.gliders[newGlider.id] = newGlider;
	},
	
	setGliderInput: function(newGlider) {
		// Set default values to empty fields
		newGlider = this.setDefaultValues(newGlider);
		
		// If creating a new glider
		if (newGlider.id === undefined) {
			newGlider.id = 'tempId' + Date.now(); // change id after server saving !!!
		}
		newGlider.initialFlightNum = parseInt(newGlider.initialFlightNum);
		newGlider.initialAirtime = parseFloat(newGlider.initialAirtime);
		newGlider.creationDateTime = Util.today() + ' ' + Util.timeNow();
		return newGlider;
	},
	
	setDefaultValues: function(newGlider) {
		$.each(this.formValidationConfig, function(fieldName, config) {
			// If there is default value for the field which val is null or undefined or ''
			if ((newGlider[fieldName] === null || (newGlider[fieldName] + '').trim() === '') &&
				 config.rules.defaultVal !== undefined)
			{
				// Set it to its default value
				newGlider[fieldName] = config.rules.defaultVal;
			}
		});
		return newGlider;
	},
	
	deleteGlider: function(gliderId) {
		delete this.gliders[gliderId];
	},
	
	getNumberOfGliders: function() {
		return Object.keys(this.gliders).length;
	},
	
	getGliderNameById: function(id) {
		return this.gliders[id].name;
	},
	
	// Return last added glider id or null if no data has been added yet
	getLastAddedId: function() {
		var lastGlider = {
			id: null,
			creationDateTime: '1900-01-01 00:00:00'
		};
		$.each(this.gliders, function(gliderId, glider) {
			if (lastGlider.creationDateTime < glider.creationDateTime) {
				lastGlider = glider;
			}
		});
		return lastGlider.id;
	},
	
	getGliderSimpleList: function() {
		var simpleList = {};
		$.each(this.gliders, function(gliderId, glider) {
			simpleList[gliderId] = glider.name;
		});
		return simpleList;
	},
	
	getGliderIdsList: function() {
		return Object.keys(this.gliders);
	},
	
	getValidationConfig: function() {
		return this.formValidationConfig;
	}
};


module.exports = GliderModel;


