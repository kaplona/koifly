'use strict';

var React = require('react');
// var History = require('react-router').History;

var listViewMixin = require('../mixins/list-view-mixin');
var SiteModel = require('../../models/site');

var DesktopTopGrid = require('../common/grids/desktop-top-grid');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var Section = require('../common/section/section');
var Switcher = require('../common/switcher');
var Table = require('../common/table');
var View = require('../common/view');



var SiteListView = React.createClass({

    mixins: [ listViewMixin(SiteModel.getModelKey()) ], // already includes history mixin

    getInitialState: function() {
        return {
            items: null,
            loadingError: null
        };
    },

    handleToMapView: function() {
        this.history.pushState(null, '/sites/map');
    },

    renderSwitcher: function() {
        return (
            <Switcher
                leftButtonCaption='List'
                rightButtonCaption='Map'
                onRightClick={ this.handleToMapView }
                initialPosition='left'
                />
        );
    },

    renderTable: function() {
        var columnsConfig = [
            {
                key: 'name',
                label: 'Name',
                defaultSortingDirection: true
            },
            {
                key: 'location',
                label: 'Location',
                defaultSortingDirection: true
            },
            {
                key: 'launchAltitude',
                label: 'Altitude',
                defaultSortingDirection: false
            }
        ];

        return (
            <Table
                columns={ columnsConfig }
                rows={ this.state.items || [] }
                initialSortingField='name'
                onRowClick={ this.handleRowClick }
                />
        );
    },

    render: function() {
        var content = this.renderError();

        if (!content) {
            content = this.renderEmptyList();
        }

        if (!content) {
            content = this.renderTable();
        }

        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                <MobileTopMenu
                    header='Sites'
                    leftButtonCaption='Map'
                    rightButtonCaption='Add'
                    onLeftClick={ this.handleToMapView }
                    onRightClick={ this.handleAddItem }
                    />
                <NavigationMenu currentView={ SiteModel.getModelKey() } />
                
                <Section>
                    <DesktopTopGrid
                        leftElement={ this.renderAddItemButton() }
                        middleElement={ this.renderSwitcher() }
                        />

                    { content }
                    { this.renderLoader() }
                </Section>
            </View>
        );
    }
});


module.exports = SiteListView;
