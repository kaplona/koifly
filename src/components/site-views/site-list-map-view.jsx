'use strict';

var React = require('react');
var History = require('react-router').History;
var SiteModel = require('../../models/site');
var View = require('./../common/view');
var TopMenu = require('../common/menu/top-menu');
var BottomMenu = require('../common/menu/bottom-menu');
var StaticMap = require('./../common/maps/static-map');
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

    handleToListView: function() {
        this.history.pushState(null, '/sites/');
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
        if (this.state.loadingError !== null) {
            return (
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>
            );
        }
    },

    renderMap: function() {
        var siteList = this.state.sites;
        return (siteList !== null) ? <StaticMap markers={ siteList } fullScreen={ true } /> : <Loader />;
    },

    render: function() {
        var content = this.renderError();

        if (!content) {
            content = this.renderMap();
        }

        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <TopMenu
                    headerText='Sites'
                    leftText='List'
                    rightText='+'
                    onLeftClick={ this.handleToListView }
                    onRightClick={ this.handleSiteAdding }
                    />
                { content }
                <BottomMenu isSiteView={ true } />
            </View>
        );
    }
});


module.exports = SiteListMapView;
