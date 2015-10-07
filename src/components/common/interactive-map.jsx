'use strict';

var React = require('react');
var PubSub = require('pubsub-js');
var $ = require('jquery');
var Map = require('../../models/map');
var PilotModel = require('../../models/pilot');


var InteractiveMap = React.createClass({
	
	propTypes: {
		markerId:  React.PropTypes.oneOfType([
			React.PropTypes.object, // null
			React.PropTypes.number,
			React.PropTypes.string
		]),
		center: React.PropTypes.shape({
			lat: React.PropTypes.number,
			lng: React.PropTypes.number
		}),
		zoomLevel: React.PropTypes.number,
		markerPosition: React.PropTypes.shape({
			lat: React.PropTypes.number,
			lng: React.PropTypes.number
		}),
		location: React.PropTypes.string,
		launchAltitude: React.PropTypes.oneOfType([
			React.PropTypes.number,
			React.PropTypes.string
		]),
		altitudeUnits: React.PropTypes.string,
		onDataApply: React.PropTypes.func.isRequired
	},
	
	getDefaultProps: function() {
		return {
			markerId: 'new',
			center: Map.center.region, // !!! current location or last added site
			zoomLevel: Map.zoomLevel.region,
			markerPosition: Map.outOfMapCoordinates,
			location: '',
			launchAltitude: '',
			altitudeUnits: PilotModel.getAltitudeUnits()
		};
	},
	
	componentWillMount: function() {
		PubSub.subscribe('infowindowContentChanged', this.changeInfowindowContent);
	},
	
	componentDidMount: function() {
		var mapContainer = this.refs.map.getDOMNode();
		
		Map.createMap(mapContainer, this.props.center, this.props.zoomLevel);
		Map.createMarker(this.props.markerId, this.props.markerPosition, true);
		Map.addMarkerMoveEventListner(this.props.markerId);
		Map.createInfowindow(this.props.markerId, '');
		Map.bindMarkerAndInfowindow(this.props.markerId);
		if (this.props.markerPosition !== null) {
			Map.requestPositionInfo(this.props.markerPosition);
		}
	},
	
	shouldComponentUpdate: function(nextProps) {
		if (nextProps.markerPosition !== this.props.markerPosition) {
			Map.moveMarker(nextProps.markerPosition, this.props.markerId);
		}
		return false;
	},
	
	componentWillUnmount: function() {
		PubSub.unsubscribe(this.changeInfowindowContent);
		$('#apply_google_data').off('click');
		Map.unmountMap();
	},
	
	changeInfowindowContent: function(eventName, infowindowContent) {
		// If all google map information requests were completed
		if (infowindowContent.address !== undefined &&
			infowindowContent.elevation !== undefined &&
			infowindowContent.coordinates !== undefined
		) {
			// Formate infowindow content
			var address = infowindowContent.address;
			var altitude = PilotModel.getAltitudeInPilotUnits(parseFloat(infowindowContent.elevation)); // Google map returns elevtion in meters
			var coordinates = infowindowContent.coordinates;
			var infowindowContentHtml = this.composeInfowindowMessage(address, altitude, coordinates);

			Map.setInfowindowContent(this.props.markerId, infowindowContentHtml);
			Map.openInfowindow(this.props.markerId);
			
			$('#apply_google_data').on('click', function() {
				this.applyGoogleData(address, infowindowContent.elevation, coordinates);
			}.bind(this));
		}
	},
	
	composeInfowindowMessage: function(location, altitude, coordinates) {
		// Mark checkbox as checked if related form field is empty
		// Checked values will then be tranfered to the fields
		var checkbox = {
			location: this.props.location ? '' : 'checked',
			launchAltitude: this.props.launchAltitude ? '' : 'checked'
		};
		
		return '<div>' +
					'<div>' +
						'<input id="location_checkbox" type="checkbox" ' + checkbox.location +
							' style="display:inline;width:12px;">' +
						location +
					'</div>' +
					'<div>' +
						'<input id="launchAltitude_checkbox" type="checkbox" ' + checkbox.launchAltitude +
							' style="display:inline;width:12px;">' +
						altitude + ' ' + this.props.altitudeUnits +
					'</div>' +
					'<div>' +
						'<input type="checkbox" style="display:inline;width:12px;" checked disabled>' +
						coordinates +
					'</div>' +
					'<button id="apply_google_data" type="button">Apply</button>' +
			   '</div>';
	},
	
	applyGoogleData: function(location, elevation, coordinates) {
		// If tranfering adress
		if ($('#location_checkbox').prop('checked')) {
			this.props.onDataApply('location', location);
		}
		// If transfering elevation
		if ($('#launchAltitude_checkbox').prop('checked')) {
			// Convert elevation into units that user chose in the form
			var altitudeUnits = this.props.altitudeUnits;
			var altitude = parseFloat(elevation);
			var newLaunchAltitude = PilotModel.getAltitudeInGivenUnits(altitude, altitudeUnits);
			this.props.onDataApply('launchAltitude', newLaunchAltitude);
		}
		// Coordinates transfers anyway
		this.props.onDataApply('coordinates', coordinates);
	},
	
	render: function() {
		return <div className='map_container' ref='map' />;
	}
});


module.exports = InteractiveMap;



