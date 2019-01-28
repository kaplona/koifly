'use strict';

var React = require('react');
var browserHistory = require('react-router').browserHistory;

var PilotModel = require('../../models/pilot');
var PublicLinksMixin = require('../mixins/public-links-mixin');
var Util = require('../../utils/util');

var AppLink = require('../common/app-link');
var DaysSinceLastFlight = require('../common/days-since-last-flight');
var ErrorBox = require('../common/notice/error-box');
var SectionLoader = require('../common/section/section-loader');
var MobileButton = require('../common/buttons/mobile-button');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var RowContent = require('../common/section/row-content');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var View = require('../common/view');


var PilotView = React.createClass({

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
        var pilot = PilotModel.getPilotOutput();
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
                onRightClick={ this.handleEditPilotInfo }
                />
        );
    },

    renderNavigationMenu: function() {
        return <NavigationMenu currentView={ PilotModel.getModelKey() } />;
    },

    renderSimpleLayout: function(children) {
        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                <MobileTopMenu header='Pilot' />
                { this.renderNavigationMenu() }
                { children }
            </View>
        );
    },

    renderError: function() {
        return this.renderSimpleLayout(
            <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleStoreModified } />
        );
    },

    renderLoader: function() {
        return this.renderSimpleLayout(<SectionLoader />);
    },

    renderMobileButtons: function() {
        return (
            <div>
                <MobileButton
                    caption='Change Password'
                    onClick={ this.handleChangePassword }
                    />

                <MobileButton
                    caption='Log Out'
                    buttonStyle='warning'
                    onClick={ this.handleLogout }
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

        var { flightNumThisYear, flightNumTotal } = this.state.pilot;
        if (flightNumThisYear) {
            flightNumTotal += `, incl. this year: ${flightNumThisYear}`;
        }

        return (
            <View onStoreModified={ this.handleStoreModified }>
                { this.renderMobileTopMenu() }
                { this.renderNavigationMenu() }

                <Section onEditClick={ this.handleEditPilotInfo }>
                    <SectionTitle>
                        <div>{ this.state.pilot.userName }</div>
                        <div>{ this.state.pilot.email }</div>
                    </SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Flights:'
                            value={ flightNumTotal }
                            />
                    </SectionRow>
                    
                    <SectionRow>
                        <RowContent
                            label='Airtime:'
                            value={ Util.formatTime(this.state.pilot.airtimeTotal) }
                            />
                    </SectionRow>
                    
                    <SectionRow>
                        <RowContent
                            label='Sites flown:'
                            value={ this.state.pilot.siteNum }
                            />
                    </SectionRow>
                    
                    <SectionRow>
                        <RowContent
                            label='Gliders used:'
                            value={ this.state.pilot.gliderNum }
                            />
                    </SectionRow>
                    
                    <SectionRow isLast={ true }>
                        <DaysSinceLastFlight days={ this.state.pilot.daysSinceLastFlight }/>
                    </SectionRow>

                    <SectionTitle>Settings</SectionTitle>

                    <SectionRow isLast={ true }>
                        <RowContent
                            label='Altitude units:'
                            value={ this.state.pilot.altitudeUnit }
                            />
                    </SectionRow>

                    <SectionRow isDesktopOnly={ true } isLast={ true }>
                        <RowContent
                            label='Account password:'
                            value={ <AppLink onClick={ this.handleChangePassword }> Change password </AppLink> }
                            />
                    </SectionRow>
                </Section>

                { this.renderMobileButtons() }
            </View>
        );
    }
});


module.exports = PilotView;
