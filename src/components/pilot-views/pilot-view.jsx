'use strict';

const React = require('react');
const AppLink = require('../common/app-link');
const browserHistory = require('react-router').browserHistory;
const DaysSinceLastFlight = require('../common/days-since-last-flight');
const ErrorBox = require('../common/notice/error-box');
const SectionLoader = require('../common/section/section-loader');
const MobileButton = require('../common/buttons/mobile-button');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const NavigationMenu = require('../common/menu/navigation-menu');
const PilotModel = require('../../models/pilot');
const PublicLinksMixin = require('../mixins/public-links-mixin');
const RowContent = require('../common/section/row-content');
const Section = require('../common/section/section');
const SectionRow = require('../common/section/section-row');
const SectionTitle = require('../common/section/section-title');
const Util = require('../../utils/util');
const View = require('../common/view');


const PilotView = React.createClass({

  mixins: [ PublicLinksMixin ],

  getInitialState: function() {
    return {
      pilot: null, // no data received
      loadingError: null
    };
  },

  handleEditPilotInfo: function() {
    browserHistory.push('/pilot/edit');
  },

  handleChangePassword: function() {
    browserHistory.push('/pilot/edit/change-password');
  },

  handleLogout: function() {
    PilotModel
      .logout()
      .then(() => this.handleGoToLogin)
      .catch(() => window.alert('Server error. Could not log out.'));
  },

  handleStoreModified: function() {
    const pilot = PilotModel.getPilotOutput();
    if (pilot && pilot.error) {
      this.setState({ loadingError: pilot.error });
    } else {
      this.setState({
        pilot: pilot,
        loadingError: null
      });
    }
  },

  renderMobileTopMenu: function() {
    return (
      <MobileTopMenu
        header='Pilot'
        rightButtonCaption='Edit'
        onRightClick={this.handleEditPilotInfo}
      />
    );
  },

  renderNavigationMenu: function() {
    return <NavigationMenu currentView={PilotModel.getModelKey()}/>;
  },

  renderSimpleLayout: function(children) {
    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        <MobileTopMenu header='Pilot'/>
        {this.renderNavigationMenu()}
        {children}
      </View>
    );
  },

  renderError: function() {
    return this.renderSimpleLayout(
      <ErrorBox error={this.state.loadingError} onTryAgain={this.handleStoreModified}/>
    );
  },

  renderLoader: function() {
    return this.renderSimpleLayout(<SectionLoader/>);
  },

  renderMobileButtons: function() {
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
  },

  render: function() {
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

          <SectionRow isLast={true}>
            <RowContent
              label='Altitude units:'
              value={this.state.pilot.altitudeUnit}
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
});


module.exports = PilotView;
