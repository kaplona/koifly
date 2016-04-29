'use strict';

var React = require('react');
var _ = require('lodash');

var listViewMixin = require('../mixins/list-view-mixin');
var FlightModel = require('../../models/flight');
var Util = require('../../utils/util');

var DesktopTopGrid = require('../common/grids/desktop-top-grid');
var ErrorBox = require('../common/notice/error-box');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var Section = require('../common/section/section');
var Table = require('../common/table');
var View = require('../common/view');



var FlightListView = React.createClass({

    mixins: [ listViewMixin(FlightModel.getModelKey()) ],
    
    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                header='Flights'
                rightButtonCaption='Add'
                onRightClick={ this.handleAddItem }
                />
        );
    },

    renderError: function() {
        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                <MobileTopMenu header='Flights' />
                { this.renderNavigationMenu() }
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleStoreModified } />;
            </View>
        );
    },
  
    renderTable: function() {
        var columns = [
            {
                key: 'formattedDate',
                label: 'Date',
                defaultSortingDirection: false,
                sortingKey: 'date'
            },
            {
                key: 'siteName',
                label: 'Site',
                defaultSortingDirection: true
            },
            {
                key: 'altitude',
                label: 'Altitude',
                defaultSortingDirection: false
            },
            {
                key: 'airtime',
                label: 'Airtime',
                defaultSortingDirection: false
            }
        ];
        
        var rows = [];
        if (this.state.items) {
            for (var i = 0; i < this.state.items.length; i++) {
                rows.push(_.extend(
                    {},
                    this.state.items[i],
                    { formattedDate: Util.formatDate(this.state.items[i].date) }
                ));
            }
        }
        
        return (
            <Table
                columns={ columns }
                rows={ rows }
                initialSortingField='date'
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
                    <DesktopTopGrid leftElement={ this.renderAddItemButton() } />
                    { content }
                    { this.renderLoader() }
                </Section>
                
            </View>
        );
    }
});


module.exports = FlightListView;
