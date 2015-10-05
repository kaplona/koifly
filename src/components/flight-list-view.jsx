'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var FlightModel = require('../models/flight');
var Table = require('./common/table');
var Button = require('./common/button');


var FlightListView = React.createClass({
	
	getInitialState: function() {
		return {
			flights: FlightModel.getFlightsArray()
		};
	},
	
	render: function() {
		var columnsConfig = [
			{
				key: 'date',
				label: 'Date',
				defaultSortingDirection: false
			},
			{
				key: 'siteName',
				label: 'Site',
				defaultSortingDirection: true
			},
			{
				key: 'altitude',
				label: 'Altitude',
				defaultSortingDirection: false
			},
			{
				key: 'airtime',
				label: 'Airtime',
				defaultSortingDirection: false
			}
		];
		
		return (
			<div>
				<Table
					columns={ columnsConfig }
					rows={ this.state.flights }
					initialSortingField='date'
					urlPath='/flight/' />
				<Link to='/flight/0/edit'><Button>Add Flight</Button></Link>
			</div>
		);
	}
});


module.exports = FlightListView;



