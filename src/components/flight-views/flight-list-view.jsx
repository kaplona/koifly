'use strict';

var React = require('react');

var listViewMixin = require('../mixins/list-view-mixin');
var FlightModel = require('../../models/flight');

var DesktopTopGrid = require('../common/grids/desktop-top-grid');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var Section = require('../common/section/section');
var Table = require('../common/table');
var View = require('../common/view');



var FlightListView = React.createClass({

    mixins: [ listViewMixin(FlightModel.getModelKey()) ],

    getInitialState: function() {
        return {
            items: null,
            loadingError: null
        };
    },
  
    renderTable: function() {
        var columns = [
            {
                key: 'date',
                label: 'Date',
                defaultSortingDirection: false
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
        
        return (
            <Table
                columns={ columns }
                rows={ this.state.items || [] }
                initialSortingField='date'
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
                    header='Flights'
                    rightButtonCaption='Add'
                    onRightClick={ this.handleAddItem }
                    />
                <NavigationMenu currentView={ FlightModel.getModelKey() } />
                
                <Section>
                    <DesktopTopGrid
                        leftElement={ this.renderAddItemButton() }
                        />

                    { content }
                    
                    { this.renderLoader() }
                </Section>
            </View>
        );
    }
});


module.exports = FlightListView;
