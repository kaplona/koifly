'use strict';

const React = require('react');
const _ = require('lodash');
const Altitude = require('../../utils/altitude');
const browserHistory = require('react-router').browserHistory;
const DesktopTopGrid = require('../common/grids/desktop-top-grid');
const ErrorBox = require('../common/notice/error-box');
const listViewMixin = require('../mixins/list-view-mixin');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const Section = require('../common/section/section');
const SiteModel = require('../../models/site');
const Switcher = require('../common/switcher');
const Table = require('../common/table');
const View = require('../common/view');


const SiteListView = React.createClass({

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
        onLeftClick={this.handleGoToMapView}
        onRightClick={this.handleAddItem}
      />
    );
  },

  renderError: function() {
    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        <MobileTopMenu header='Sites'/>
        {this.renderNavigationMenu()}
        <ErrorBox error={this.state.loadingError} onTryAgain={this.handleStoreModified}/>;
      </View>
    );
  },

  renderSwitcher: function() {
    return (
      <Switcher
        leftButtonCaption='List'
        rightButtonCaption='Map'
        onRightClick={this.handleGoToMapView}
        initialPosition='left'
      />
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

    const rows = [];
    if (this.state.items) {
      for (let i = 0; i < this.state.items.length; i++) {
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
          <DesktopTopGrid
            leftElement={this.renderAddItemButton()}
            middleElement={this.renderSwitcher()}
          />
          {content}
          {this.renderLoader()}
        </Section>

      </View>
    );
  }
});


module.exports = SiteListView;
