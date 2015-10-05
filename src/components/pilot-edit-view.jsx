'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var $ = require('jquery');
var _ = require('underscore');
var PilotModel = require('../models/pilot');
var Validation = require('../models/validation');
var Button = require('./common/button');
var TextInput = require('./common/text-input');
var TimeInput = require('./common/time-input');
var DropDown = require('./common/dropdown');


var PilotEditView = React.createClass({
	
	mixins: [ History ],
	
	getInitialState: function() {
		var pilotInfo = PilotModel.getPilotEditOutput();
		pilotInfo.hours = Math.floor(pilotInfo.initialAirtime / 60);
		pilotInfo.minutes = pilotInfo.initialAirtime % 60;
		return {
			pilotInfo: pilotInfo,
			errors: {
				initialFlightNum: '',
				initialAirtime: '',
				altitudeUnits: '',
				hours: '',
				minutes: ''
			}
		};
	},

	handleSubmit: function(e) {
		e.preventDefault();
		var validationRespond = this.validateForm();
		// If no errors
		if (validationRespond === true) {
			var newPilotInfo =  _.clone(this.state.pilotInfo);
			newPilotInfo.initialAirtime = parseInt(newPilotInfo.hours) * 60 + parseInt(newPilotInfo.minutes);
			PilotModel.savePilotInfo(newPilotInfo);
			this.history.pushState(null, '/pilot');
		};
	},

	handleInputChange: function(inputName, inputValue) {
		var newPilotInfo =  _.clone(this.state.pilotInfo);
		newPilotInfo[inputName] = inputValue;
		this.setState({ pilotInfo: newPilotInfo }, function() {
			this.validateForm(true);
		});
	},

	validateForm: function(softValidation) {
		var newPilotInfo =  _.clone(this.state.pilotInfo);
		var validationRespond = Validation.validateForm(
				PilotModel.getValidationConfig(),
				newPilotInfo,
				softValidation
		);
		// update errors state
		var newErrorState =  _.clone(this.state.errors);
		$.each(newErrorState, function(fieldName) {
			newErrorState[fieldName] = validationRespond[fieldName] ? validationRespond[fieldName] : '';
		});
		this.setState({ errors: newErrorState });

		return validationRespond;
	},
	
	render: function() {
		var rawAltitudeUnitsList = PilotModel.getAltitudeUnitsList();
		var altitudeUnitsList = rawAltitudeUnitsList.map(function(unitName) {
			return {
				value: unitName,
				text: unitName
			};
		});
		
		return (
			<form onSubmit={ this.handleSubmit }>
				<div className='container__title'>{ this.state.pilotInfo.userName }</div>
				
				<div>My achievements before Koifly:</div>
				
				<TextInput
					inputValue={ this.state.pilotInfo.initialFlightNum }
					labelText='Number of Flights:'
					errorMessage={ this.state.errors.initialFlightNum }
					onChange={ this.handleInputChange.bind(this, 'initialFlightNum') } />
				
				<TimeInput
					hours={ this.state.pilotInfo.hours }
					minutes={ this.state.pilotInfo.minutes }
					labelText='Airtime:'
					errorMessageHours={ this.state.errors.hours }
					errorMessageMinutes={ this.state.errors.minutes }
					onChange={ this.handleInputChange } />

				<div className='line' />
				<div>My settings:</div>

				<DropDown
					selectedValue={ this.state.pilotInfo.altitudeUnits }
					options={ altitudeUnitsList }
					labelText='Altitude units:'
					errorMessage={ this.state.errors.altitudeUnits }
					onChangeFunc={ this.handleInputChange.bind(this, 'altitudeUnits') } />
				
				<div className='button__menu'>
					<Button type='submit'>Save</Button>
					<Link to='/pilot'><Button>Cancel</Button></Link>
				</div>
			</form>
		);
	}
});


module.exports = PilotEditView;



