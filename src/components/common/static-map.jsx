'use strict';

var React = require('react');
var Map = require('../../models/map');
var SiteModel = require('../../models/site');


var StaticMap = React.createClass({
	
	propTypes: {
		center: React.PropTypes.shape({
			lat: React.PropTypes.number,
			lng: React.PropTypes.number
		}),
		zoomLevel: React.PropTypes.number,
		markers:  React.PropTypes.arrayOf(React.PropTypes.shape({
			id: React.PropTypes.oneOfType([
				React.PropTypes.number,
				React.PropTypes.string
			]),
			name: React.PropTypes.string,
			location: React.PropTypes.string,
			launchAltitude: React.PropTypes.oneOfType([
				React.PropTypes.number,
				React.PropTypes.string
			]),
			altitudeUnits: React.PropTypes.string,
			cordinates: React.PropTypes.shape({
				lat: React.PropTypes.number,
				lng: React.PropTypes.number
			})
		}))
	},
	
	getDefaultProps: function() {
		return {
			center: Map.center.region, // !!! current location or last added site
			zoomLevel: Map.zoomLevel.region,
			markers: []
		};
	},
	
	componentDidMount: function() {
		var markerId, markerPosition, infowindowContent;
		var mapContainer = this.refs.map.getDOMNode();
		Map.createMap(mapContainer, this.props.center, this.props.zoomLevel);
		for (var i = 0; i < this.props.markers.length; i++) {
			if (this.props.markers[i].coordinates) {
				markerId = this.props.markers[i].id;
				markerPosition = SiteModel.getLatLngCoordinates(markerId);
				Map.createMarker(markerId, markerPosition, false);
				infowindowContent = this.composeInfowindowMessage(this.props.markers[i]);
				Map.createInfowindow(markerId, infowindowContent);
				Map.bindMarkerAndInfowindow(markerId);
			};
		};
	},
	
	shouldComponentUpdate: function(nextProps, nextState) {
		return false;
	},
	
	componentWillUnmount: function() {
		Map.unmountMap();
	},
	
	composeInfowindowMessage: function(site) {
		return '<div>' +
					'<div><a href="/site/' + site.id + '">' + site.name + '</a></div>' +
					'<div>' + site.location + '</div>' +
					'<div>' + site.launchAltitude + ' ' + site.altitudeUnits + '</div>' +
					'<div>' + site.coordinates + '</div>' +
			   '</div>';
	},
	
	render: function() {
		return <div className='map_container' ref='map' />;
	}
});

module.exports = StaticMap;




