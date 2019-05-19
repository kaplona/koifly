'use strict';

const React = require('react');
const browserHistory = require('react-router').browserHistory;
const DesktopTopGrid = require('../common/grids/desktop-top-grid');
const ErrorBox = require('../common/notice/error-box');
const listViewMixin = require('../mixins/list-view-mixin');
const Loader = require('../common/loader');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const Section = require('../common/section/section');
const SiteModel = require('../../models/site');
const StaticMap = require('../common/maps/static-map');
const Switcher = require('../common/switcher');
const View = require('../common/view');


const SiteListMapView = React.createClass({

  mixins: [listViewMixin(SiteModel.getModelKey())],

  handleGoToListView: function () {
    browserHistory.push('/sites/');
  },

  renderMobileTopMenu: function () {
    return (
      <MobileTopMenu
        header='Sites'
        leftButtonCaption='List'
        rightButtonCaption='Add'
        onLeftClick={this.handleGoToListView}
        onRightClick={this.handleAddItem}
      />
    );
  },

  renderError: function () {
    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        <MobileTopMenu header='Sites'/>
        {this.renderNavigationMenu()}
        <ErrorBox error={this.state.loadingError} onTryAgain={this.handleStoreModified}/>;
      </View>
    );
  },

  renderSwitcher: function () {
    return (
      <Switcher
        leftButtonCaption='List'
        rightButtonCaption='Map'
        onLeftClick={this.handleGoToListView}
        initialPosition='right'
      />
    );
  },

  renderMap: function () {
    const siteList = this.state.items;
    return siteList ? StaticMap.create({sites: siteList, isFullScreen: true}) : <Loader/>;
  },

  render: function () {
    if (this.state.loadingError) {
      return this.renderError();
    }

    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        {this.renderMobileTopMenu()}
        {this.renderNavigationMenu()}

        <Section isFullScreen={true}>
          <DesktopTopGrid
            leftElement={this.renderAddItemButton()}
            middleElement={this.renderSwitcher()}
          />

          {this.renderMap()}
        </Section>
      </View>
    );
  }
});


module.exports = SiteListMapView;
