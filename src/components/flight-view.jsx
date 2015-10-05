'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var Util = require('../models/util');
var Map = require('../models/map');
var FlightModel = require('../models/flight');
var SiteModel = require('../models/site');
var PilotModel = require('../models/pilot');
var Button = require('./common/button');
var StaticMap = require('./common/static-map');


var FlightView = React.createClass({

	propTypes: {
		params: React.PropTypes.shape({
			flightId: React.PropTypes.string.isRequired
		})
	},
	
	getInitialState: function() {
		return {
			flight: FlightModel.getFlightOutput(this.props.params.flightId)
		};
	},
	
	renderMap: function() {
		var siteId = this.state.flight.siteId;
		if (siteId !== null) {
			var siteList = [];
			siteList.push(SiteModel.getSiteOutput(this.state.flight.siteId));
			return (
				<StaticMap
					center={ SiteModel.getLatLngCoordinates(siteId) }
					zoomLevel={ Map.zoomLevel.site }
					markers={ siteList } />
			);
		};
		return '';
	},
	
	render: function() {
		var altitudeUnits = PilotModel.getAltitudeUnits();
		
		return (
			<div>
				<div><Link to='/flights'>Back to Flights</Link></div>
				<div className='container__title'>
					<div>{ this.state.flight.date }</div>
					<div>{ this.state.flight.siteName }</div>
				</div>
				<div className='container__subtitle'>
					<div>
						Altitude gained: { this.state.flight.altitude + ' ' + altitudeUnits }
					</div>
					<div>
						Above the launch: { this.state.flight.altitudeAboveLaunch + ' ' + altitudeUnits }
					</div>
					<div>Airtime: { Util.hoursMinutes(this.state.flight.airtime) }</div>
					<div>Glider: { this.state.flight.gliderName }</div>
					<div>Remarks:</div>
					<div>{ this.state.flight.remarks }</div>
				</div>
				<div className='button__menu'>
					<Link to={ '/flight/' + this.props.params.flightId + '/edit' }><Button>Edit</Button></Link>
					<Link to='/flight/0/edit'><Button>Add Flight</Button></Link>
				</div>
				{ this.renderMap() }
			</div>
		);
	}
});


module.exports = FlightView;



