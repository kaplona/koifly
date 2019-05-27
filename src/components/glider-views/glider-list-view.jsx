'use strict';

import React from 'react';
import Button from '../common/buttons/button';
import DesktopTopGrid from '../common/grids/desktop-top-grid';
import EmptyList from '../common/empty-list';
import ErrorBox from '../common/notice/error-box';
import GliderModel from '../../models/glider';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import Section from '../common/section/section';
import SectionLoader from '../common/section/section-loader';
import Table from '../common/table';
import Util from '../../utils/util';
import View from '../common/view';


export default class GliderListView extends React.Component {
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
    const storeContent = GliderModel.getListOutput();

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
    navigationService.goToNewItemView(GliderModel.keys.single);
  }

  handleRowClick(itemId) {
    navigationService.goToItemView(GliderModel.keys.single, itemId)
  }

  renderMobileTopMenu() {
    return (
      <MobileTopMenu
        header='Gliders'
        rightButtonCaption='Add'
        onRightClick={this.handleAddItem}
      />
    );
  }

  renderError() {
    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        <MobileTopMenu header='Gliders'/>
        {this.renderNavigationMenu()}
        <ErrorBox error={this.state.loadingError} onTryAgain={this.handleStoreModified}/>
      </View>
    );
  }

  renderLoader() {
    return (this.state.items === null) ? <SectionLoader/> : null;
  }

  renderEmptyList() {
    if (this.state.items && this.state.items.length === 0) {
      return <EmptyList ofWhichItems={GliderModel.keys.plural} onAdding={this.handleAddItem}/>;
    }
  }

  renderNavigationMenu() {
    return <NavigationMenu currentView={GliderModel.getModelKey()}/>;
  }

  renderAddItemButton() {
    return <Button caption='Add Glider' onClick={this.handleAddItem}/>;
  }

  renderTable() {
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

    const rows = (this.state.items || []).map(glider => (
      Object.assign({}, glider, {
        formattedAirtime: Util.formatTime(glider.trueAirtime)
      })
    ));

    return (
      <Table
        columns={columnsConfig}
        rows={rows}
        initialSortingField='name'
        onRowClick={this.handleRowClick}
      />
    );
  }

  render() {
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
}
