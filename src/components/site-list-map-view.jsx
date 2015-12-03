'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var _ = require('underscore');
var SiteModel = require('../models/site');
var View = require('./common/view');
var StaticMap = require('./common/static-map');
var Button = require('./common/button');
var Loader = require('./common/loader');
var ErrorBox = require('./common/error-box');


var SiteListMapView = React.createClass({

    getInitialState: function() {
        return {
            sites: null,
            loadingError: null
        };
    },

    onDataModified: function() {
        var sites = SiteModel.getSitesArray();
        if (sites !== null && sites.error) {
            this.setState({ loadingError: sites.error });
        } else {
            this.setState({
                sites: sites,
                loadingError: null
            });
        }
    },

    renderError: function() {
        return (
            <View onDataModified={ this.onDataModified }>
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.onDataModified }/>
            </View>
        );
    },

    renderMap: function() {
        var siteList = _.clone(this.state.sites);
        return (this.state.sites !== null) ? <StaticMap markers={ siteList } /> : <Loader />;
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        return (
            <View onDataModified={ this.onDataModified }>
                <Link to='/sites'>Back to Site List</Link>
                { this.renderMap() }
                <Link to='/site/0/edit'><Button>Add Site</Button></Link>
            </View>
        );
    }
});


module.exports = SiteListMapView;
