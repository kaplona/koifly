'use strict';

var $ = require('jquery');
var PubSub = require('./pubsub');
var DataService = require('../services/dataService');


var GliderModel = {

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
		if (DataService.data.gliders === null) {
			return null;
		}
		var gliderOutputs = [];
		$.each(DataService.data.gliders, (gliderId) => gliderOutputs.push(this.getGliderOutput(gliderId)));
		return gliderOutputs;
	},
	
	getGliderOutput: function(id) {
		if (DataService.data.gliders === null) {
			return null;
		}
		if (DataService.data.gliders[id] === undefined) {
			return null;
		}
		var FlightModel = require('./flight');
		var trueFlightNum = DataService.data.gliders[id].initialFlightNum + FlightModel.getNumberOfFlightsOnGlider(id);
		var trueAirtime = DataService.data.gliders[id].initialAirtime + FlightModel.getGliderAirtime(id);
		
		return {
			id: id,
			name: DataService.data.gliders[id].name,
			initialFlightNum: DataService.data.gliders[id].initialFlightNum,
			initialAirtime: DataService.data.gliders[id].initialAirtime,
			remarks: DataService.data.gliders[id].remarks,
			trueFlightNum: trueFlightNum,
			trueAirtime: trueAirtime
		};
	},
	
	getNewGliderOutput: function() {
		if (DataService.data.gliders === null) {
			return null;
		}
		return {
			name: '',
			initialFlightNum: 0,
			initialAirtime: 0,
			remarks: ''
		};
	},
	
	saveGlider: function(newGlider) {
		newGlider = this.setGliderInput(newGlider);
		DataService.changeGliders([ newGlider ]);
	},
	
	setGliderInput: function(newGlider) {
		// Set default values to empty fields
		newGlider = this.setDefaultValues(newGlider);
		newGlider.initialFlightNum = parseInt(newGlider.initialFlightNum);
		newGlider.initialAirtime = parseFloat(newGlider.initialAirtime);
		return newGlider;
	},
	
	setDefaultValues: function(newGlider) {
		$.each(this.formValidationConfig, (fieldName, config) => {
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
		PubSub.emit('gliderDeleted', { gliderId: gliderId });
		DataService.changeGliders([ { id: gliderId, see: 0 } ]);
	},
	
	getNumberOfGliders: function() {
		return Object.keys(DataService.data.gliders).length;
	},
	
	getGliderNameById: function(id) {
		return DataService.data.gliders[id].name;
	},
	
	// Return last added glider id or null if no data has been added yet
	getLastAddedId: function() {
		var lastGlider = {
			id: null,
			creationDateTime: '1900-01-01 00:00:00'
		};
		$.each(DataService.data.gliders, (gliderId, glider) => {
			if (lastGlider.creationDateTime < glider.creationDateTime) {
				lastGlider = glider;
			}
		});
		return lastGlider.id;
	},
	
	getGliderSimpleList: function() {
		var simpleList = {};
		$.each(DataService.data.gliders, (gliderId, glider) => {
			simpleList[gliderId] = glider.name;
		});
		return simpleList;
	},
	
	getGliderIdsList: function() {
		return Object.keys(DataService.data.gliders);
	},
	
	getValidationConfig: function() {
		return this.formValidationConfig;
	}
};


module.exports = GliderModel;
