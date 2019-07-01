import React from 'react';
import { shape, string } from 'prop-types';
import { Link } from 'react-router-dom';
import Altitude from '../../utils/altitude';
import BreadCrumbs from '../common/bread-crumbs';
import ErrorBox from '../common/notice/error-box';
import FightMapAndCharts from './flight-map-and-charts';
import FlightModel from '../../models/flight';
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


export default class FlightView extends React.Component {
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
    const storeContent = FlightModel.getItemOutput(this.props.match.params.id);

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
    navigationService.goToListView(FlightModel.keys.plural);
  }

  handleEditItem() {
    navigationService.goToEditView(FlightModel.keys.single, this.props.match.params.id);
  }

  renderNavigationMenu() {
    return <NavigationMenu currentView={FlightModel.getModelKey()}/>;
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

    const { date, flightNumDay, numOfFlightsThatDay } = this.state.item;
    const flightName = `${date} (${flightNumDay}/${numOfFlightsThatDay})`;

    return (
      <View onStoreModified={this.handleStoreModified}>
        {this.renderMobileTopMenu()}
        {this.renderNavigationMenu()}

        <Section onEditClick={this.handleEditItem}>
          <BreadCrumbs
            elements={[
              <Link to='/flights'>Flights</Link>,
              flightName
            ]}
          />

          <SectionTitle>
            <div>{Util.formatDate(this.state.item.date)}</div>
            <div>{this.state.item.siteName}</div>
          </SectionTitle>

          <SectionRow>
            <RowContent
              label='Flight number:'
              value={[
                Util.addOrdinalSuffix(this.state.item.flightNum),
                ', in ',
                Util.getDateYear(date).toString(),
                ': ',
                Util.addOrdinalSuffix(this.state.item.flightNumYear)
              ].join('')}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Max altitude:'
              value={Altitude.formatAltitude(this.state.item.altitude)}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Above launch:'
              value={Altitude.formatAltitude(this.state.item.altitudeAboveLaunch)}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Airtime:'
              value={Util.formatTime(this.state.item.airtime)}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Glider:'
              value={Util.formatText(this.state.item.gliderName)}
            />
          </SectionRow>

          <RemarksRow value={this.state.item.remarks}/>

          <FightMapAndCharts
            igc={this.state.item.igc}
            siteId={this.state.item.siteId}
          />
        </Section>
      </View>
    );
  }
}


FlightView.propTypes = {
  match: shape({
    params: shape({
      id: string.isRequired // url args
    }).isRequired
  }).isRequired
};
