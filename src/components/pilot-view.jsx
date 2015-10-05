'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var Util = require('../models/util');
var PilotModel = require('../models/pilot');
var SiteModel = require('../models/site');
var Button = require('./common/button');
var DaysSinceLastFlight = require('./common/days-since-last-flight');


var PilotView = React.createClass({
	
	getInitialState: function() {
		return {
			pilot: PilotModel.getPilotOutput()
		};
	},
	
	render: function() {
		
		var airtimeTotal = Util.hoursMinutes(this.state.pilot.airtimeTotal);
		
		return (
			<div>
				<div className='container__title'>{ this.state.pilot.userName }</div>
				<div className='container__subtitle'>
					<div>Flights #: { this.state.pilot.flightNumTotal }</div>
					<div>Total Airtime: { airtimeTotal }</div>
					<div>Sites #: { this.state.pilot.siteNum }</div>
					<div>Gliders #: { this.state.pilot.gliderNum }</div>
					<DaysSinceLastFlight />
				</div>
				
				<div className='line' />
				
				<div className='container__title'>Settings</div>
				<div className='container__subtitle'>
					Altitude units: { this.state.pilot.altitudeUnits }
				</div>
				
				<Link to='/pilot/edit'><Button>Edit</Button></Link>
			</div>
		);
	}
});


module.exports = PilotView;



