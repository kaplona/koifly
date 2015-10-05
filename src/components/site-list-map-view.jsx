'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var _ = require('underscore');
var SiteModel = require('../models/site');
var StaticMap = require('./common/static-map');
var Button = require('./common/button');


var SiteListMapView = React.createClass({
	
	getInitialState: function() {
		return {
			sites: SiteModel.getSitesArray()
		};
	},
	
	render: function() {
		var siteList = _.clone(this.state.sites);
		
		return (
			<div>
				<Link to='/sites'>Back to Site List</Link>
				<StaticMap markers={ siteList } />
				<Link to='/site/0/edit'><Button>Add Site</Button></Link>
			</div>
		);
	}
});


module.exports = SiteListMapView;