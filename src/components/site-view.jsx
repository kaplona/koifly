'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var History = ReactRouter.History;
var _ = require('underscore');
var Map = require('../utils/map');
var SiteModel = require('../models/site');
var View = require('./common/view');
var StaticMap = require('./common/static-map');
var Button = require('./common/button');
var Loader = require('./common/loader');
var ErrorBox = require('./common/error-box');


var SiteView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            siteId: React.PropTypes.string.isRequired
        })
    },

    mixins: [ History ],

    getInitialState: function() {
        return {
            site: null,
            loadingError: null
        };
    },

    handleSiteEditing: function() {
        this.history.pushState(null, '/site/' + this.props.params.siteId + '/edit');
    },

    handleSiteAdding: function() {
        this.history.pushState(null, '/site/0/edit');
    },

    handleDataModified: function() {
        var site = SiteModel.getSiteOutput(this.props.params.siteId);
        if (site !== null && site.error) {
            this.setState({ loadingError: site.error });
        } else {
            this.setState({
                site: site,
                loadingError: null
            });
        }
    },

    renderError: function() {
        return (
            <View onDataModified={ this.handleDataModified }>
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>
            </View>
        );
    },

    renderLoader: function() {
        return (
            <View onDataModified={ this.handleDataModified }>
                <Link to='/sites'>Back to Sites</Link>
                <Loader />
                { this.renderButtonMenu() }
            </View>
        );
    },

    renderButtonMenu: function() {
        return (
            <div className='button__menu'>
                <Button onClick={ this.handleSiteEditing }>Edit</Button>
                <Button onClick={ this.handleSiteAdding }>Add Site</Button>
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
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.site === null) {
            return this.renderLoader();
        }

        return (
            <View onDataModified={ this.handleDataModified }>
                <Link to='/sites'>Back to Sites</Link>
                <div className='container__title'>
                    { this.state.site.name }
                </div>
                <div className='container__subtitle'>
                    <div>Location: { this.state.site.location }</div>
                    <div>
                        Launch Altitude:
                        { this.state.site.launchAltitude + ' ' + this.state.site.altitudeUnit }
                    </div>
                    <div>Coordinates: { this.state.site.coordinates }</div>
                    <div>Remarks:</div>
                    <div>{ this.state.site.remarks }</div>
                </div>
                { this.renderButtonMenu() }
                { this.renderMap() }
            </View>
        );
    }
});



module.exports = SiteView;
