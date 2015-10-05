'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var Util = require('../models/util');
var GliderModel = require('../models/glider');
var Button = require('./common/button');


var GliderListView = React.createClass({
	
	getInitialState: function() {
		return {
			gliders: GliderModel.getGlidersArray()
		};
	},
	
	render: function() {
		var gliderNodes = this.state.gliders.map(function(glider) {
			return (
				<div key={ glider.id }>
					<div className='container__title'>
						{ glider.name }
					</div>
					<div className='container__subtitle'>
						<div>Flights #: { glider.trueFlightNum }</div>
						<div>Total Airtime: { Util.hoursMinutes(glider.trueAirtime) }</div>
					</div>
					<div>{ glider.remarks }</div>
					<Link to={ '/glider/' + glider.id + '/edit' }><Button>Edit</Button></Link>
				</div>
			);
		}.bind(this));
		
		return (
			<div>
				<Link to='/glider/0/edit'><Button>Add Glider</Button></Link>
				<div>{ gliderNodes }</div>
			</div>
		);
	}
});


module.exports = GliderListView;



