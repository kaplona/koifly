'use strict';

var React = require('react');
// var History = require('react-router').History;

var listViewMixin = require('../mixins/list-view-mixin');
var SiteModel = require('../../models/site');

var DesktopTopGrid = require('../common/grids/desktop-top-grid');
var Loader = require('../common/loader');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var Section = require('../common/section/section');
var StaticMap = require('../common/maps/static-map');
var Switcher = require('../common/switcher');
var View = require('../common/view');


var SiteListMapView = React.createClass({

    mixins: [ listViewMixin(SiteModel.getModelKey()) ], // already includes history mixin

    getInitialState: function() {
        return {
            items: null,
            loadingError: null
        };
    },

    handleToListView: function() {
        this.history.pushState(null, '/sites/');
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
        var siteList = this.state.items;
        return siteList ? StaticMap.create({ sites: siteList, isFullScreen: true }) : <Loader />;
    },

    render: function() {
        var content = this.renderError();

        if (!content) {
            content = this.renderMap();
        }

        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                <MobileTopMenu
                    header='Sites'
                    leftButtonCaption='List'
                    rightButtonCaption='Add'
                    onLeftClick={ this.handleToListView }
                    onRightClick={ this.handleAddItem }
                    />
                <NavigationMenu currentView={ SiteModel.getModelKey() } />
                
                <Section isFullScreen={ true }>
                    <DesktopTopGrid
                        leftElement={ this.renderAddItemButton() }
                        middleElement={ this.renderSwitcher() }
                        />

                    { content }
                </Section>
            </View>
        );
    }
});


module.exports = SiteListMapView;
