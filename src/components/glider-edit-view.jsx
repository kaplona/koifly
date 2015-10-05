'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var $ = require('jquery');
var _ = require('underscore');
var PubSub = require('pubsub-js');
var GliderModel = require('../models/glider');
var Validation = require('../models/validation');
var Button = require('./common/button');
var TextInput = require('./common/text-input');
var TimeInput = require('./common/time-input');
var RemarksInput = require('./common/remarks-input');


var GliderEditView = React.createClass({
	
	mixins: [ History ],
	
	getInitialState: function() {
		var glider;
		if (this.props.params.gliderId) {
			glider = GliderModel.getGliderOutput(this.props.params.gliderId);	
		} else {
			glider = GliderModel.getNewGliderOutput();
		};
		
		// TODO
		// if (glider === null) {
		// 	throw new ViewRenderException();
		// };
		
		glider.hours = Math.floor(glider.initialAirtime / 60);
		glider.minutes = glider.initialAirtime % 60;
		return {
			glider: glider,
			errors: {
				name: '',
				initialFlightNum: '',
				initialAirtime: '',
				hours: '',
				minutes: ''
			}
		};
	},
	
	validateForm: function(softValidation) {
		var newGlider =  _.clone(this.state.glider);
		var validationRespond = Validation.validateForm(
			GliderModel.getValidationConfig(),
			newGlider,
			softValidation
		);
		// update errors state
		var newErrorState =  _.clone(this.state.errors);
		$.each(newErrorState, function(fieldName, errorMessage) {
			newErrorState[fieldName] = validationRespond[fieldName] ? validationRespond[fieldName] : '';
		});
		this.setState({ errors: newErrorState });
		
		return validationRespond;
	},
	
	handleSubmit: function(e) {
		e.preventDefault();
		var validationRespond = this.validateForm();
		// If no errors
		if (validationRespond === true) {
			var newGlider =  _.clone(this.state.glider);
			newGlider.initialAirtime = parseInt(newGlider.hours) * 60 + parseInt(newGlider.minutes);
			GliderModel.saveGlider(newGlider);
			this.history.pushState(null, '/gliders');
		};
	},
	
	handleInputChange: function(inputName, inputValue) {
		var newGlider =  _.clone(this.state.glider);
		newGlider[inputName] = inputValue;
		this.setState({ glider: newGlider }, function() {
			this.validateForm(true);
		});
	},
	
	handleDeleteGlider: function() {
		GliderModel.deleteGlider(this.props.params.gliderId);
		PubSub.publish('delete.glider', { gliderId: this.props.params.gliderId });
	},
	
	renderDeleteButton: function() {
		if (this.props.params.gliderId) {
			return (
				<Link to='/gliders'>
					<Button onClick={ this.handleDeleteGlider }>Delete</Button>
				</Link>
			);
		};
		return '';
	},
	
	render: function() {
		return (
			<div>
				<Link to='/gliders'>Back to Gliders</Link>
				<form onSubmit={this.handleSubmit}>
					<TextInput
						inputValue={ this.state.glider.name }
						labelText={ <span>Name<sup>*</sup>:</span> }
						errorMessage={ this.state.errors.name }
						onChange={ this.handleInputChange.bind(this, 'name') } />
					
					<div>Glider usage before Koifly:</div>
					
					<TextInput
						inputValue={ this.state.glider.initialFlightNum }
						labelText='Number of Flights:'
						errorMessage={ this.state.errors.initialFlightNum }
						onChange={ this.handleInputChange.bind(this, 'initialFlightNum') } />
					
					<TimeInput
						hours={ this.state.glider.hours }
						minutes={this.state.glider.minutes}
						labelText='Airtime:'
						errorMessageHours={ this.state.errors.hours }
						errorMessageMinutes={ this.state.errors.minutes }
						onChange={ this.handleInputChange } />
						
					<RemarksInput
						inputValue={ this.state.glider.remarks }
						labelText='Remarks'
						onChange={ this.handleInputChange.bind(this, 'remarks') } />
					
					<div className='button__menu'>
						<Button type='submit'>Save</Button>
						{ this.renderDeleteButton() }
						<Link to='/gliders'><Button>Cancel</Button></Link>
					</div>
				</form>
			</div>
		);
	}
});


module.exports = GliderEditView;



