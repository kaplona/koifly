'use strict';

var React = require('react');
var History = require('react-router').History;
var SiteModel = require('../../models/site');
var View = require('./../common/view');
var TopMenu = require('../common/menu/top-menu');
var TopButtons = require('../common/buttons/top-buttons');
var BottomMenu = require('../common/menu/bottom-menu');
var Section = require('../common/section/section');
var StaticMap = require('./../common/maps/static-map');
var Loader = require('./../common/loader');
var Switcher = require('../common/switcher');
var Button = require('../common/buttons/button');
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

    renderAddSiteButton: function() {
        return <Button text='Add Site' onClick={ this.handleSiteAdding }/>;
    },

    renderSwitcher: function() {
        return (
            <Switcher
                leftText = 'List'
                rightText = 'Map'
                onLeftClick = { this.handleToListView }
                initialPosition = 'right'
                />
        );
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
                <Section isFullScreen={ true }>
                    <TopMenu
                        headerText='Sites'
                        leftText='List'
                        rightText='Add'
                        onLeftClick={ this.handleToListView }
                        onRightClick={ this.handleSiteAdding }
                        />

                    <TopButtons
                        leftElement={ this.renderAddSiteButton() }
                        middleElement={ this.renderSwitcher() }
                        />

                    { content }
                </Section>
                <BottomMenu isSiteView={ true } />
            </View>
        );
    }
});


module.exports = SiteListMapView;
