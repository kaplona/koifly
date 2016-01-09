'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var SiteModel = require('../../models/site');
var View = require('./../common/view');
var StaticMap = require('./../common/maps/static-map');
var Button = require('./../common/button');
var Loader = require('./../common/loader');
var ErrorBox = require('./../common/notice/error-box');


var SiteListMapView = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            sites: null,
            loadingError: null
        };
    },

    handleSiteAdding: function() {
        this.history.pushState(null, '/site/0/edit');
    },

    handleDataModified: function() {
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
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>
            </View>
        );
    },

    renderMap: function() {
        var siteList = this.state.sites;
        return (siteList !== null) ? <StaticMap markers={ siteList } /> : <Loader />;
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        return (
            <View onDataModified={ this.handleDataModified }>
                <Link to='/sites'>Back to Site List</Link>
                { this.renderMap() }
                <Button onClick={ this.handleSiteAdding }>Add Site</Button>
            </View>
        );
    }
});


module.exports = SiteListMapView;
