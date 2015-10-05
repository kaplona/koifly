'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var _ = require('underscore');
var Map = require('../models/map');
var SiteModel = require('../models/site');
var StaticMap = require('./common/static-map');
var Button = require('./common/button');


var SiteView = React.createClass({
	
	getInitialState: function() {
		return {
			site: SiteModel.getSiteOutput(this.props.params.siteId)
		};
	},
	
	renderMap: function() {
		if (this.state.site.coordinates) {
			var site =  _.clone(this.state.site);
			var siteList = [];
			siteList.push(site);
			return (
				<StaticMap
					center={ SiteModel.getLatLngCoordinates(site.id) }
					zoomLevel={ Map.zoomLevel.site }
					markers={ siteList } />
			);
		};
		return '';
	},
	
	render: function() {
		return (
			<div>
				<Link to='/sites'>Back to Sites</Link>
				<div className='container__title'>
					{ this.state.site.name }
				</div>
				<div className='container__subtitle'>
					<div>Location: { this.state.site.location }</div>
					<div>
						Launch Altitude:
						{ this.state.site.launchAltitude + ' ' + this.state.site.altitudeUnits }
					</div>
					<div>Coordinates: { this.state.site.coordinates }</div>
					{/* TODO add remarks to sites
					<div>Remarks:</div>
					<div>{ this.state.site.remarks }</div> */}
				</div>
				<div className='button__menu'>
					<Link to={ '/site/' + this.props.params.siteId + '/edit' }><Button>Edit</Button></Link>
					<Link to='/site/0/edit'><Button>Add Flight</Button></Link>
				</div>
				{ this.renderMap() }
			</div>
		);
	}
});



module.exports = SiteView;



