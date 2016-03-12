'use strict';

var React = require('react');
var History = require('react-router').History;

var SiteModel = require('../../models/site');

var Button = require('../common/buttons/button');
var DesktopTopGrid = require('../common/grids/desktop-top-grid');
var ErrorBox = require('../common/notice/error-box');
var Loader = require('../common/loader');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var Section = require('../common/section/section');
var StaticMap = require('../common/maps/static-map');
var Switcher = require('../common/switcher');
var View = require('../common/view');


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
        return <Button caption='Add Site' onClick={ this.handleSiteAdding } />;
    },

    renderSwitcher: function() {
        return (
            <Switcher
                leftButtonCaption='List'
                rightButtonCaption='Map'
                onLeftClick={ this.handleToListView }
                initialPosition='right'
                />
        );
    },

    renderMap: function() {
        var siteList = this.state.sites;
        return siteList ? <StaticMap sites={ siteList } isFullScreen={ true } /> : <Loader />;
    },

    render: function() {
        var content = this.renderError();

        if (!content) {
            content = this.renderMap();
        }

        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <MobileTopMenu
                    header='Sites'
                    leftButtonCaption='List'
                    rightButtonCaption='Add'
                    onLeftClick={ this.handleToListView }
                    onRightClick={ this.handleSiteAdding }
                    />
                <NavigationMenu isSiteView={ true } />
                
                <Section isFullScreen={ true }>
                    <DesktopTopGrid
                        leftElement={ this.renderAddSiteButton() }
                        middleElement={ this.renderSwitcher() }
                        />

                    { content }
                </Section>
            </View>
        );
    }
});


module.exports = SiteListMapView;
