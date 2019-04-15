'use strict';

const React = require('react');
const _ = require('lodash');
const Altitude = require('../../utils/altitude');
const listViewMixin = require('../mixins/list-view-mixin');
const FlightModel = require('../../models/flight');
const Util = require('../../utils/util');

const DesktopTopGrid = require('../common/grids/desktop-top-grid');
const ErrorBox = require('../common/notice/error-box');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const Section = require('../common/section/section');
const Table = require('../common/table');
const View = require('../common/view');


const FlightListView = React.createClass({

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
        const columns = [
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
                key: 'formattedAltitude',
                label: 'Altitude',
                defaultSortingDirection: false,
                sortingKey: 'altitude'
            },
            {
                key: 'formattedAirtime',
                label: 'Airtime',
                defaultSortingDirection: false,
                sortingKey: 'airtime'
            }
        ];

        const rows = (this.state.items || []).map(flight => (
            Object.assign({}, flight, {
                formattedDate: Util.formatDate(flight.date),
                formattedAltitude: Altitude.formatAltitudeShort(flight.altitude),
                formattedAirtime: Util.formatTime(flight.airtime),
            })
        ));

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
