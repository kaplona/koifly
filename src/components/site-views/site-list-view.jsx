import React from 'react';
import Altitude from '../../utils/altitude';
import Button from '../common/buttons/button';
import DesktopTopGrid from '../common/grids/desktop-top-grid';
import EmptyList from '../common/empty-list';
import ErrorBox from '../common/notice/error-box';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import Section from '../common/section/section';
import SectionLoader from '../common/section/section-loader';
import SiteModel from '../../models/site';
import Switcher from '../common/switcher';
import Table from '../common/table';
import View from '../common/view';


export default class SiteListView extends React.Component {
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

  handleRowClick(itemId) {
    navigationService.goToItemView(SiteModel.keys.single, itemId);
  }

  renderMobileTopMenu() {
    return (
      <MobileTopMenu
        header='Sites'
        leftButtonCaption='Map'
        rightButtonCaption='Add'
        onLeftClick={navigationService.goToSiteMapView}
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
        onRightClick={navigationService.goToSiteMapView}
        initialPosition='left'
      />
    );
  }

  renderLoader() {
    return (this.state.items === null) ? <SectionLoader/> : null;
  }

  renderEmptyList() {
    if (this.state.items && this.state.items.length === 0) {
      return <EmptyList ofWhichItems={SiteModel.keys.plural} onAdding={this.handleAddItem}/>;
    }
  }

  renderNavigationMenu() {
    return <NavigationMenu currentView={SiteModel.getModelKey()}/>;
  }

  renderAddItemButton() {
    return <Button caption='Add Site' onClick={this.handleAddItem}/>;
  }

  renderTable() {
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

    const rows = (this.state.items || []).map(site => (
      Object.assign({}, site, {
        formattedAltitude: Altitude.formatAltitudeShort(site.launchAltitude)
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
}
