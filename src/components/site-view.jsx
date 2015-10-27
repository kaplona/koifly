'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var _ = require('underscore');
var Map = require('../utils/map');
var SiteModel = require('../models/site');
var View = require('./common/view');
var StaticMap = require('./common/static-map');
var Button = require('./common/button');
var Loader = require('./common/loader');


var SiteView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            siteId: React.PropTypes.string.isRequired
        })
    },

    getInitialState: function() {
        return {
            site: null
        };
    },

    onDataModified: function() {
        var site = SiteModel.getSiteOutput(this.props.params.siteId);
        if (site === false) {
            // TODO if no site with given id => show error
            return;
        }
        this.setState({ site: site });
    },

    renderLoader: function() {
        return (
            <div>
                <Link to='/sites'>Back to Sites</Link>
                <Loader />
                <div className='button__menu'>
                    <Link to={ '/site/' + this.props.params.siteId + '/edit' }>
                        <Button>Edit</Button>
                    </Link>
                    <Link to='/site/0/edit'><Button>Add Site</Button></Link>
                </div>
            </div>
        );
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
                    markers={ siteList }
                    />
            );
        }
        return '';
    },

    render: function() {
        if (this.state.site === null) {
            return (
                <View onDataModified={ this.onDataModified }>
                    { this.renderLoader() }
                </View>
            );
        }

        return (
            <View onDataModified={ this.onDataModified }>
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
                    <div>Remarks:</div>
                    <div>{ this.state.site.remarks }</div>
                </div>
                <div className='button__menu'>
                    <Link to={ '/site/' + this.props.params.siteId + '/edit' }><Button>Edit</Button></Link>
                    <Link to='/site/0/edit'><Button>Add Site</Button></Link>
                </div>
                { this.renderMap() }
            </View>
        );
    }
});



module.exports = SiteView;
