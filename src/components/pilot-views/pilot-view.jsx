import React from 'react';
import AppLink from '../common/app-link';
import DaysSinceLastFlight from '../common/days-since-last-flight';
import ErrorBox from '../common/notice/error-box';
import SectionLoader from '../common/section/section-loader';
import MobileButton from '../common/buttons/mobile-button';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import PilotModel from '../../models/pilot';
import RowContent from '../common/section/row-content';
import Section from '../common/section/section';
import SectionRow from '../common/section/section-row';
import SectionTitle from '../common/section/section-title';
import Util from '../../utils/util';
import View from '../common/view';


export default class PilotView extends React.Component {
  constructor() {
    super();
    this.state = {
      pilot: null, // no data received
      loadingError: null
    };

    this.handleStoreModified = this.handleStoreModified.bind(this);
  }

  handleEditPilotInfo() {
    navigationService.goToPilotEdit();
  }

  handleChangePassword() {
    navigationService.goToPilotChangePassword();
  }

  handleLogout() {
    PilotModel
      .logout()
      .then(() => navigationService.goToLogin)
      .catch(() => window.alert('Server error. Could not log out.'));
  }

  handleStoreModified() {
    const pilot = PilotModel.getPilotOutput();
    if (pilot && pilot.error) {
      this.setState({ loadingError: pilot.error });
    } else {
      this.setState({
        pilot: pilot,
        loadingError: null
      });
    }
  }

  renderMobileTopMenu() {
    return (
      <MobileTopMenu
        header='Pilot'
        rightButtonCaption='Edit'
        onRightClick={this.handleEditPilotInfo}
      />
    );
  }

  renderNavigationMenu() {
    return <NavigationMenu currentView={PilotModel.getModelKey()}/>;
  }

  renderSimpleLayout(children) {
    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        <MobileTopMenu header='Pilot'/>
        {this.renderNavigationMenu()}
        {children}
      </View>
    );
  }

  renderError() {
    return this.renderSimpleLayout(
      <ErrorBox error={this.state.loadingError} onTryAgain={this.handleStoreModified}/>
    );
  }

  renderLoader() {
    return this.renderSimpleLayout(<SectionLoader/>);
  }

  renderMobileButtons() {
    return (
      <div>
        <MobileButton
          caption='Change Password'
          onClick={this.handleChangePassword}
        />

        <MobileButton
          caption='Log Out'
          buttonStyle='warning'
          onClick={this.handleLogout}
        />
      </div>
    );
  }

  render() {
    if (this.state.loadingError) {
      return this.renderError();
    }

    if (this.state.pilot === null) {
      return this.renderLoader();
    }

    let { flightNumTotal } = this.state.pilot;
    if (this.state.pilot.flightNumThisYear) {
      flightNumTotal += `, incl. this year: ${this.state.pilot.flightNumThisYear}`;
    }

    return (
      <View onStoreModified={this.handleStoreModified}>
        {this.renderMobileTopMenu()}
        {this.renderNavigationMenu()}

        <Section onEditClick={this.handleEditPilotInfo}>
          <SectionTitle>
            <div>{this.state.pilot.userName}</div>
            <div>{this.state.pilot.email}</div>
          </SectionTitle>

          <SectionRow>
            <RowContent
              label='Flights:'
              value={flightNumTotal}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Airtime:'
              value={Util.formatTime(this.state.pilot.airtimeTotal)}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Sites flown:'
              value={this.state.pilot.siteNum}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Gliders used:'
              value={this.state.pilot.gliderNum}
            />
          </SectionRow>

          <SectionRow isLast={true}>
            <DaysSinceLastFlight days={this.state.pilot.daysSinceLastFlight}/>
          </SectionRow>

          <SectionTitle>Settings</SectionTitle>

          <SectionRow>
            <RowContent
              label='Altitude units:'
              value={this.state.pilot.altitudeUnit}
            />
          </SectionRow>

          <SectionRow isLast={true}>
            <RowContent
              label='Distance units:'
              value={this.state.pilot.distanceUnit}
            />
          </SectionRow>

          <SectionRow isDesktopOnly={true} isLast={true}>
            <RowContent
              label='Account password:'
              value={<AppLink onClick={this.handleChangePassword}> Change password </AppLink>}
            />
          </SectionRow>
        </Section>

        {this.renderMobileButtons()}
      </View>
    );
  }
}
