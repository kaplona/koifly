import React from 'react';
import { shape, string } from 'prop-types';
import { Link } from 'react-router-dom';
import Altitude from '../../utils/altitude';
import BreadCrumbs from '../common/bread-crumbs';
import ErrorBox from '../common/notice/error-box';
import mapConstants from '../../constants/map-constants';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import RemarksRow from '../common/section/remarks-row';
import RowContent from '../common/section/row-content';
import Section from '../common/section/section';
import SectionLoader from '../common/section/section-loader';
import SectionRow from '../common/section/section-row';
import SectionTitle from '../common/section/section-title';
import SiteModel from '../../models/site';
import StaticMap from '../common/maps/static-map';
import Util from '../../utils/util';
import View from '../common/view';


export default class SiteView extends React.Component {
  constructor() {
    super();
    this.state = {
      item: null, // no data received
      loadingError: null
    };

    this.handleStoreModified = this.handleStoreModified.bind(this);
    this.handleEditItem = this.handleEditItem.bind(this);
  }

  /**
   * Once store data was modified or on initial rendering,
   * requests for presentational data form the Model
   * and updates component's state
   */
  handleStoreModified() {
    const storeContent = SiteModel.getItemOutput(this.props.match.params.id);

    if (storeContent && storeContent.error) {
      this.setState({ loadingError: storeContent.error });
    } else {
      this.setState({
        item: storeContent,
        loadingError: null
      });
    }
  }

  handleGoToListView() {
    navigationService.goToListView(SiteModel.keys.plural);
  }

  handleEditItem() {
    navigationService.goToEditView(SiteModel.keys.single, this.props.match.params.id);
  }

  renderNavigationMenu() {
    return <NavigationMenu currentView={SiteModel.getModelKey()}/>;
  }

  renderSimpleLayout(children) {
    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        <MobileTopMenu
          leftButtonCaption='Back'
          onLeftClick={this.handleGoToListView}
        />
        {this.renderNavigationMenu()}
        {children}
      </View>
    );
  }

  renderLoader() {
    return this.renderSimpleLayout(<SectionLoader/>);
  }

  renderError() {
    return this.renderSimpleLayout(
      <ErrorBox error={this.state.loadingError} onTryAgain={this.handleStoreModified}/>
    );
  }

  renderMobileTopMenu() {
    return (
      <MobileTopMenu
        leftButtonCaption='Back'
        rightButtonCaption='Edit'
        onLeftClick={this.handleGoToListView}
        onRightClick={this.handleEditItem}
      />
    );
  }

  renderMap() {
    if (this.state.item.coordinates) {
      return StaticMap.create({
        center: SiteModel.getLatLng(this.state.item.id),
        zoomLevel: mapConstants.ZOOM_LEVEL.site,
        sites: [ this.state.item ]
      });
    }
  }

  render() {
    if (this.state.loadingError) {
      return this.renderError();
    }

    if (this.state.item === null) {
      return this.renderLoader();
    }

    let { flightNum } = this.state.item;
    if (this.state.item.flightNumThisYear) {
      flightNum += `, incl. this year: ${this.state.item.flightNumThisYear}`;
    }

    return (
      <View onStoreModified={this.handleStoreModified}>
        {this.renderMobileTopMenu()}
        {this.renderNavigationMenu()}

        <Section onEditClick={this.handleEditItem}>
          <BreadCrumbs
            elements={[
              <Link to='/sites'>Sites</Link>,
              this.state.item.name
            ]}
          />

          <SectionTitle>
            {this.state.item.name}
          </SectionTitle>

          <SectionRow>
            <RowContent
              label='Location:'
              value={Util.formatText(this.state.item.location)}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Launch altitude:'
              value={Altitude.formatAltitude(this.state.item.launchAltitude)}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Coordinates:'
              value={this.state.item.coordinates ? this.state.item.coordinates : '—'}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Flights:'
              value={flightNum}
            />
          </SectionRow>

          <RemarksRow value={this.state.item.remarks}/>

          {this.renderMap()}
        </Section>
      </View>
    );
  }
}


SiteView.propTypes = {
  match: shape({
    params: shape({
      id: string.isRequired // url args
    }).isRequired
  }).isRequired
};
