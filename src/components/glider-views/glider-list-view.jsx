'use strict';

const React = require('react');
const _ = require('lodash');
const DesktopTopGrid = require('../common/grids/desktop-top-grid');
const ErrorBox = require('../common/notice/error-box');
const GliderModel = require('../../models/glider');
const listViewMixin = require('../mixins/list-view-mixin');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const Section = require('../common/section/section');
const Table = require('../common/table');
const Util = require('../../utils/util');
const View = require('../common/view');


const GliderListView = React.createClass({

  mixins: [ listViewMixin(GliderModel.getModelKey()) ],

  renderMobileTopMenu: function() {
    return (
      <MobileTopMenu
        header='Gliders'
        rightButtonCaption='Add'
        onRightClick={this.handleAddItem}
      />
    );
  },

  renderError: function() {
    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        <MobileTopMenu header='Gliders'/>
        {this.renderNavigationMenu()}
        <ErrorBox error={this.state.loadingError} onTryAgain={this.handleStoreModified}/>
      </View>
    );
  },

  renderTable: function() {
    const columnsConfig = [
      {
        key: 'name',
        label: 'Name',
        defaultSortingDirection: true
      },
      {
        key: 'trueFlightNum',
        label: 'Flights',
        defaultSortingDirection: false
      },
      {
        key: 'formattedAirtime',
        label: 'Airtime',
        defaultSortingDirection: false,
        sortingKey: 'trueAirtime'
      }
    ];

    const rows = [];
    if (this.state.items) {
      for (let i = 0; i < this.state.items.length; i++) {
        rows.push(_.extend(
          {},
          this.state.items[i],
          {
            formattedAirtime: Util.formatTime(this.state.items[i].trueAirtime)
          }
        ));
      }
    }

    return (
      <Table
        columns={columnsConfig}
        rows={rows}
        initialSortingField='name'
        onRowClick={this.handleRowClick}
      />
    );
  },

  render: function() {
    if (this.state.loadingError) {
      return this.renderError();
    }

    let content = this.renderEmptyList();
    if (!content) {
      content = this.renderTable();
    }

    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        {this.renderMobileTopMenu()}
        {this.renderNavigationMenu()}

        <Section>
          <DesktopTopGrid leftElement={this.renderAddItemButton()}/>
          {content}
          {this.renderLoader()}
        </Section>
      </View>
    );
  }
});


module.exports = GliderListView;
