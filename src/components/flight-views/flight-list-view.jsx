'use strict';

import React from 'react';
import Altitude from '../../utils/altitude';
import Button from '../common/buttons/button';
import DesktopTopGrid from '../common/grids/desktop-top-grid';
import EmptyList from '../common/empty-list';
import ErrorBox from '../common/notice/error-box';
import FlightModel from '../../models/flight';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import Section from '../common/section/section';
import SectionLoader from '../common/section/section-loader';
import Table from '../common/table';
import Util from '../../utils/util';
import View from '../common/view';


export default class FlightListView extends React.Component {
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
    const storeContent = FlightModel.getListOutput();

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
    navigationService.goToNewItemView(FlightModel.keys.single);
  }

  handleRowClick(itemId) {
    navigationService.goToItemView(FlightModel.keys.single, itemId)
  }

  renderMobileTopMenu() {
    return (
      <MobileTopMenu
        header='Flights'
        rightButtonCaption='Add'
        onRightClick={this.handleAddItem}
      />
    );
  }

  renderError() {
    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        <MobileTopMenu header='Flights'/>
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
      return <EmptyList ofWhichItems={FlightModel.keys.plural} onAdding={this.handleAddItem}/>;
    }
  }

  renderNavigationMenu() {
    return <NavigationMenu currentView={FlightModel.getModelKey()}/>;
  }

  renderAddItemButton() {
    return <Button caption='Add Flight' onClick={this.handleAddItem}/>;
  }

  renderTable() {
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
        formattedAirtime: Util.formatTime(flight.airtime)
      })
    ));

    return (
      <Table
        columns={columns}
        rows={rows}
        initialSortingField='date'
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
