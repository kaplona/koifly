'use strict';

import React from 'react';
import { shape, string } from 'prop-types';
import BreadCrumbs from '../common/bread-crumbs';
import ErrorBox from '../common/notice/error-box';
import GliderModel from '../../models/glider';
import { Link } from 'react-router';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import RemarksRow from '../common/section/remarks-row';
import RowContent from '../common/section/row-content';
import Section from '../common/section/section';
import SectionLoader from '../common/section/section-loader';
import SectionRow from '../common/section/section-row';
import SectionTitle from '../common/section/section-title';
import Util from '../../utils/util';
import View from '../common/view';


export default class GliderView extends React.Component {
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
    const storeContent = GliderModel.getItemOutput(this.props.params.id);

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
    navigationService.goToListView(GliderModel.keys.plural);
  }

  handleEditItem() {
    navigationService.goToEditView(GliderModel.keys.single, this.props.params.id);
  }

  renderNavigationMenu() {
    return <NavigationMenu currentView={GliderModel.getModelKey()}/>;
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

  render() {
    if (this.state.loadingError) {
      return this.renderError();
    }

    if (this.state.item === null) {
      return this.renderLoader();
    }

    let { trueFlightNum } = this.state.item;
    if (this.state.item.flightNumThisYear) {
      trueFlightNum += `, incl. this year: ${this.state.item.flightNumThisYear}`;
    }

    return (
      <View onStoreModified={this.handleStoreModified}>
        {this.renderMobileTopMenu()}
        {this.renderNavigationMenu()}

        <Section onEditClick={this.handleEditItem}>
          <BreadCrumbs
            elements={[
              <Link to='/gliders'>Gliders</Link>,
              this.state.item.name
            ]}
          />

          <SectionTitle>
            {this.state.item.name}
          </SectionTitle>

          <SectionRow>
            <RowContent
              label='Total flights:'
              value={trueFlightNum}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Total airtime:'
              value={Util.formatTime(this.state.item.trueAirtime)}
            />
          </SectionRow>

          <SectionTitle isSubtitle={true}>
            Usage before Koifly
          </SectionTitle>

          <SectionRow>
            <RowContent
              label='Flights:'
              value={this.state.item.initialFlightNum}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Airtime:'
              value={Util.formatTime(this.state.item.initialAirtime)}
            />
          </SectionRow>

          <RemarksRow value={this.state.item.remarks}/>

        </Section>
      </View>
    );
  }
}


GliderView.propTypes = {
  params: shape({ // url args
    id: string.isRequired
  })
};
