'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var $ = require('jquery');
var _ = require('underscore');
var PubSub = require('../models/pubsub');
var Map = require('../models/map');
var SiteModel = require('../models/site');
var Validation = require('../models/validation');
var InteractiveMap = require('./common/interactive-map');
var Button = require('./common/button');
var TextInput = require('./common/text-input');
var AltitudeInput = require('./common/altitude-input');
// var RemarksInput = require('./common/remarks-input');
var Loader = require('./common/loader');


var SiteEditView = React.createClass({

	propTypes: {
		params: React.PropTypes.shape({
			siteId: React.PropTypes.string
		})
	},
	
	mixins: [ History ],
	
	getInitialState: function() {
		return {
			site: null,
			errors: {
				name: '',
				launchAltitude: '',
				location: '',
				coordinates: ''
			},
			markerPosition: null
		};
	},

	componentDidMount: function() {
		PubSub.on('dataModified', this.onDataModified, this);
		this.onDataModified();
	},

	componentWillUnmount: function() {
		PubSub.removeListener('dataModified', this.onDataModified, this);
	},

	handleSubmit: function(e) {
		e.preventDefault();
		var validationRespond = this.validateForm();
		// If no errors
		if (validationRespond === true) {
			var newSite =  _.clone(this.state.site);
			SiteModel.saveSite(newSite);
			this.history.pushState(null, '/sites');
		}
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
		// PubSub.publish('delete.site', { siteId: this.props.params.siteId });
	},

	onDataModified: function() {
		var site;
		if (this.props.params.siteId) {
			site = SiteModel.getSiteOutput(this.props.params.siteId);
		} else {
			site = SiteModel.getNewSiteOutput();
		}
		var markerPosition = (site !== null) ? SiteModel.getLatLngCoordinates(this.props.params.siteId) : null;
		// TODO if no site with given id => show error
		this.setState({
			site: site,
			markerPosition: markerPosition
		});
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
		$.each(newErrorState, function(fieldName) {
			newErrorState[fieldName] = validationRespond[fieldName] ? validationRespond[fieldName] : '';
		});
		this.setState({ errors: newErrorState });

		return validationRespond;
	},

	dropPinByCoordinates: function() {
		if (this.state.site.coordinates.trim() !== '' &&
			this.state.errors.coordinates === '')
		{
			// Change user input in { lat: 56.56734543, lng: 123.4567543 } form
			var newCoordinates = SiteModel.formCoordinatesInput(this.state.site.coordinates);
			this.setState({ markerPosition: newCoordinates });
		}
	},

	renderLoader: function() {
		var deleteButton = (this.props.params.siteId) ? <Button active={ false }>Delete</Button> : '';
		return (
			<div>
				<Link to='/sites'>Back to Sites</Link>
				<Loader />
				<div className='button__menu'>
					<Button active={ false }>Save</Button>
					{ deleteButton }
					<Link to={ this.props.params.siteId ? ('/site/' + this.props.params.siteId) : '/sites' }>
						<Button>Cancel</Button>
					</Link>
				</div>
			</div>
		);
	},

	renderDeleteButton: function() {
		if (this.props.params.siteId) {
			return (
				<Link to='/sites'>
					<Button onClick={ this.handleDeleteSite }>Delete</Button>
				</Link>
			);
		}
		return '';
	},

	renderMap: function() {
		var markerId = this.props.params.siteId ? this.props.params.siteId : 'new';
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
		}

		return (
			<InteractiveMap
				markerId={ markerId }
				markerPosition={ this.state.markerPosition }
				location={ this.state.site.location }
				launchAltitude={ this.state.site.launchAltitude }
				altitudeUnits={ this.state.site.altitudeUnits }
				onDataApply={ this.handleInputChange }
				/>
		);
	},
	
	render: function() {
		if (this.state.site === null) {
			return (<div>{ this.renderLoader() }</div>);
		}

		return (
			<div>
				<Link to='/sites'>Back to Sites</Link>
				<form onSubmit={ this.handleSubmit }>
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



