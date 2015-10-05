'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var SiteModel = require('../models/site');
var Table = require('./common/table');
var Button = require('./common/button');


var SiteListView = React.createClass({
	
	getInitialState: function() {
		return {
			sites: SiteModel.getSitesArray()
		};
	},
	
	render: function() {
		var columnsConfig = [
			{
				key: 'name',
				label: 'Name',
				defaultSortingDirection: true
			},
			{
				key: 'location',
				label: 'Location',
				defaultSortingDirection: true
			},
			{
				key: 'launchAltitude',
				label: 'Altitude',
				defaultSortingDirection: false
			}
		];
		
		return (
			<div>
				<div><Link to='/sites-map'>Show on Map</Link></div>
				<Table
					columns={ columnsConfig }
					rows={ this.state.sites }
					initialSortingField='name'
					urlPath='/site/' />
				<Link to='/site/0/edit'><Button>Add Site</Button></Link>
			</div>
		);
	}
});


module.exports = SiteListView;



