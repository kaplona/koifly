'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var $ = require('jquery');
var _ = require('underscore');
var PubSub = require('pubsub-js');
var Map = require('../models/map');
var SiteModel = require('../models/site');
var Validation = require('../models/validation');
var InteractiveMap = require('./common/interactive-map');
var Button = require('./common/button');
var TextInput = require('./common/text-input');
var AltitudeInput = require('./common/altitude-input');
var RemarksInput = require('./common/remarks-input');


var SiteEditView = React.createClass({
	
	mixins: [ History ],
	
	getInitialState: function() {
		var site;
		if (this.props.params.siteId) {
			site = SiteModel.getSiteOutput(this.props.params.siteId);
		} else {
			site = SiteModel.getNewSiteOutput();
		};
		
		// TODO
		// if (site === null) {
		// 	throw new ViewRenderException();
		// };
		
		return {
			site: site,
			errors: {
				name: '',
				launchAltitude: '',
				location: '',
				coordinates: ''
			},
			markerPosition: SiteModel.getLatLngCoordinates(this.props.params.siteId)
		};
	},
	
	validateForm: function(softValidation) {
		var newSite =  _.clone(this.state.site);
		var validationRespond = Validation.validateForm(
			SiteModel.getValidationConfig(),
			newSite,
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
			var newSite =  _.clone(this.state.site);
			SiteModel.saveSite(newSite);
			this.history.pushState(null, '/sites');
		};
	},
	
	handleInputChange: function(inputName, inputValue) {
		var newSite =  _.clone(this.state.site);
		newSite[inputName] = inputValue;
		this.setState({ site: newSite }, function() {
			this.validateForm(true);
		});
	},
	
	handleDeleteSite: function() {
		SiteModel.deleteSite(this.props.params.siteId);
		PubSub.publish('delete.site', { siteId: this.props.params.siteId });
	},
	
	dropPinByCoordinates: function() {
		if (this.state.site.coordinates.trim() !== '' &&
			this.state.errors.coordinates === '')
		{
			// Change user input in { lat: 56.56734543, lng: 123.4567543 } form
			var newCoordinates = SiteModel.formCoordinatesInput(this.state.site.coordinates);
			this.setState({ markerPosition: newCoordinates });
		};
	},
	
	renderDeleteButton: function() {
		if (this.props.params.siteId) {
			return (
				<Link to='/sites'>
					<Button onClick={ this.handleDeleteSite }>Delete</Button>
				</Link>
			);
		};
		return '';
	},
	
	renderMap: function() {
		var markerId = this.props.siteId ? this.props.siteId : 'new';
		if (this.state.markerPosition !== null) {
			return (
				<InteractiveMap
					markerId={ markerId }
					center={ this.state.markerPosition }
					zoomLevel={ Map.zoomLevel.site }
					markerPosition={ this.state.markerPosition }
					location={ this.state.site.location }
					launchAltitude={ this.state.site.launchAltitude }
					altitudeUnits={ this.state.site.altitudeUnits }
					onDataApply={ this.handleInputChange } />
			);
		};
		
		return (
			<InteractiveMap
				markerId={ markerId }
				markerPosition={ this.state.markerPosition }
				location={ this.state.site.location }
				launchAltitude={ this.state.site.launchAltitude }
				altitudeUnits={ this.state.site.altitudeUnits }
				onDataApply={ this.handleInputChange } />
		);
	},
	
	render: function() {
		return (
			<div>
				<Link to='/sites'>Back to Sites</Link>
				<form onSubmit={this.handleSubmit}>
					<TextInput
						inputValue={ this.state.site.name }
						labelText={ <span>Name<sup>*</sup>:</span> }
						errorMessage={ this.state.errors.name }
						onChange={ this.handleInputChange.bind(this, 'name') } />
						
					<TextInput
						inputValue={ this.state.site.location }
						labelText='Location:'
						errorMessage={ this.state.errors.location }
						onChange={ this.handleInputChange.bind(this, 'location') } />
						
					<AltitudeInput
						inputValue={ this.state.site.launchAltitude }
						selectedAltitudeUnits={ this.state.site.altitudeUnits }
						labelText='Launch Altitude:'
						fieldName='launchAltitude'
						errorMessage={ this.state.errors.launchAltitude }
						onChange={ this.handleInputChange } />
					
					<TextInput
						inputValue={ this.state.site.coordinates }
						labelText='Coordinates:'
						errorMessage={ this.state.errors.coordinates }
						onChange={ this.handleInputChange.bind(this, 'coordinates') }
						onBlur={ this.dropPinByCoordinates } />
					
					{ this.renderMap() }
					
					<div className='button__menu'>
						<Button type='submit'>Save</Button>
						{ this.renderDeleteButton() }
						<Link to={ this.props.params.siteId ? ('/site/' + this.props.params.siteId) : '/sites' }>
							<Button>Cancel</Button>
						</Link>
					</div>
				</form>
			</div>
		);
	}
});


module.exports = SiteEditView;



