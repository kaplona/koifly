'use strict';

import React from 'react';
import Button from '../common/buttons/button';
import DesktopTopGrid from '../common/grids/desktop-top-grid';
import ErrorBox from '../common/notice/error-box';
import Loader from '../common/loader';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import Section from '../common/section/section';
import SiteModel from '../../models/site';
import StaticMap from '../common/maps/static-map';
import Switcher from '../common/switcher';
import View from '../common/view';


export default class SiteListMapView extends React.Component {
  constructor() {
    super();
    this.state = {
      items: null, // no data received
      loadingError: null
    };

    this.handleStoreModified = this.handleStoreModified.bind(this);
  }

  /**
   * Once store data was modified or on initial rendering,
   * requests for presentational data form the Model and updates component's state
   */
  handleStoreModified() {
    const storeContent = SiteModel.getListOutput();

    if (storeContent && storeContent.error) {
      this.setState({ loadingError: storeContent.error });
    } else {
      this.setState({
        items: storeContent,
        loadingError: null
      });
    }
  }

  handleAddItem() {
    navigationService.goToNewItemView(SiteModel.keys.single);
  }

  renderMobileTopMenu() {
    return (
      <MobileTopMenu
        header='Sites'
        leftButtonCaption='List'
        rightButtonCaption='Add'
        onLeftClick={navigationService.goToSiteListView}
        onRightClick={this.handleAddItem}
      />
    );
  }

  renderError() {
    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        <MobileTopMenu header='Sites'/>
        {this.renderNavigationMenu()}
        <ErrorBox error={this.state.loadingError} onTryAgain={this.handleStoreModified}/>;
      </View>
    );
  }

  renderSwitcher() {
    return (
      <Switcher
        leftButtonCaption='List'
        rightButtonCaption='Map'
        onLeftClick={navigationService.goToSiteListView}
        initialPosition='right'
      />
    );
  }

  renderNavigationMenu() {
    return <NavigationMenu currentView={SiteModel.getModelKey()}/>;
  }

  renderAddItemButton() {
    return <Button caption='Add Site' onClick={this.handleAddItem}/>;
  }

  renderMap() {
    const siteList = this.state.items;
    return siteList ? StaticMap.create({ sites: siteList, isFullScreen: true }) : <Loader/>;
  }

  render() {
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
}
