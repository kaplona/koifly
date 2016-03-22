'use strict';

var React = require('react');

var listViewMixin = require('../mixins/list-view-mixin');
var GliderModel = require('../../models/glider');

var DesktopTopGrid = require('../common/grids/desktop-top-grid');
var ErrorBox = require('../common/notice/error-box');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var Section = require('../common/section/section');
var Table = require('../common/table');
var View = require('../common/view');



var GliderListView = React.createClass({

    mixins: [ listViewMixin(GliderModel.getModelKey()) ],

    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                header='Gliders'
                rightButtonCaption='Add'
                onRightClick={ this.handleAddItem }
                />
        );
    },

    renderError: function() {
        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                <MobileTopMenu header='Gliders' />
                { this.renderNavigationMenu() }
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleStoreModified } />;
            </View>
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
                key: 'trueFlightNum',
                label: 'Flight#',
                defaultSortingDirection: false
            },
            {
                key: 'trueAirtime',
                label: 'Airtime',
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
        if (this.state.loadingError !== null) {
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


module.exports = GliderListView;
