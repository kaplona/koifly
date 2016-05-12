'use strict';

var React = require('react');
var browserHistory = require('react-router').browserHistory;
var _ = require('lodash');

var Altitude = require('../../utils/altitude');
var listViewMixin = require('../mixins/list-view-mixin');
var SiteModel = require('../../models/site');

var DesktopTopGrid = require('../common/grids/desktop-top-grid');
var ErrorBox = require('../common/notice/error-box');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var Section = require('../common/section/section');
var Switcher = require('../common/switcher');
var Table = require('../common/table');
var View = require('../common/view');



var SiteListView = React.createClass({

    mixins: [ listViewMixin(SiteModel.getModelKey()) ],

    handleGoToMapView: function() {
        browserHistory.push('/sites/map');
    },
    
    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                header='Sites'
                leftButtonCaption='Map'
                rightButtonCaption='Add'
                onLeftClick={ this.handleGoToMapView }
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
                onRightClick={ this.handleGoToMapView }
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
                key: 'formattedAltitude',
                label: 'Altitude',
                defaultSortingDirection: false,
                sortingKey: 'launchAltitude'
            }
        ];

        var rows = [];
        if (this.state.items) {
            for (var i = 0; i < this.state.items.length; i++) {
                rows.push(_.extend(
                    {},
                    this.state.items[i],
                    {
                        formattedAltitude: Altitude.formatAltitudeShort(this.state.items[i].launchAltitude)
                    }
                ));
            }
        }

        return (
            <Table
                columns={ columnsConfig }
                rows={ rows }
                initialSortingField='name'
                onRowClick={ this.handleRowClick }
                />
        );
    },

    render: function() {
        if (this.state.loadingError) {
            return this.renderError();
        }

        var content = this.renderEmptyList();

        if (!content) {
            content = this.renderTable();
        }

        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                { this.renderMobileTopMenu() }
                { this.renderNavigationMenu() }
                
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
