'use strict';

var React = require('react');

var listViewMixin = require('../mixins/list-view-mixin');
var SiteModel = require('../../models/site');

var DesktopTopGrid = require('../common/grids/desktop-top-grid');
var ErrorBox = require('../common/notice/error-box');
var Loader = require('../common/loader');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var Section = require('../common/section/section');
var StaticMap = require('../common/maps/static-map');
var Switcher = require('../common/switcher');
var View = require('../common/view');


var SiteListMapView = React.createClass({

    mixins: [ listViewMixin(SiteModel.getModelKey()) ], // already includes history mixin

    handleGoToListView: function() {
        this.history.pushState(null, '/sites/');
    },
    
    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                header='Sites'
                leftButtonCaption='List'
                rightButtonCaption='Add'
                onLeftClick={ this.handleGoToListView }
                onRightClick={ this.handleAddItem }
                />
        );
    },

    renderError: function() {
        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                <MobileTopMenu header='Sites' />
                { this.renderNavigationMenu() }
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleStoreModified } />;
            </View>
        );
    },

    renderSwitcher: function() {
        return (
            <Switcher
                leftButtonCaption='List'
                rightButtonCaption='Map'
                onLeftClick={ this.handleGoToListView }
                initialPosition='right'
                />
        );
    },

    renderMap: function() {
        var siteList = this.state.items;
        return siteList ? StaticMap.create({ sites: siteList, isFullScreen: true }) : <Loader />;
    },

    render: function() {
        if (this.state.loadingError) {
            return this.renderError();
        }

        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                { this.renderMobileTopMenu() }
                { this.renderNavigationMenu() }
                
                <Section isFullScreen={ true }>
                    <DesktopTopGrid
                        leftElement={ this.renderAddItemButton() }
                        middleElement={ this.renderSwitcher() }
                        />

                    { this.renderMap() }
                </Section>
            </View>
        );
    }
});


module.exports = SiteListMapView;
