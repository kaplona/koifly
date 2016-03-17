'use strict';

var React = require('react');
var History = require('react-router').History;

var dataService = require('../../services/data-service');
var PilotModel = require('../../models/pilot');
var PublicLinksMixin = require('../mixins/public-links-mixin');
var Util = require('../../utils/util');

var AppLink = require('../common/app-link');
var DaysSinceLastFlight = require('../common/days-since-last-flight');
var ErrorBox = require('../common/notice/error-box');
var Loader = require('../common/loader');
var MobileButton = require('../common/buttons/mobile-button');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var RowContent = require('../common/section/row-content');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var View = require('../common/view');


var PilotView = React.createClass({

    mixins: [History, PublicLinksMixin],

    getInitialState: function() {
        return {
            pilot: null,
            loadingError: null
        };
    },

    handleEditPilotInfo: function() {
        this.history.pushState(null, '/pilot/edit');
    },

    handleChangePassword: function() {
        this.history.pushState(null, '/pilot/edit/change-password');
    },

    handleLogout: function() {
        dataService.logout();
        this.handleToHomePage();
    },

    handleStoreModified: function() {
        var pilot = PilotModel.getPilotOutput();
        if (pilot !== null && pilot.error) {
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
        return this.renderSimpleLayout(<ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleStoreModified } />);
    },

    renderLoader: function() {
        return this.renderSimpleLayout(<Loader />);
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
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.pilot === null) {
            return this.renderLoader();
        }

        var { airtimeTotal, flightNumThisYear, flightNumTotal } = this.state.pilot;

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
                            value={ `${flightNumTotal} ( this year: ${flightNumThisYear} )` }
                            />
                    </SectionRow>
                    
                    <SectionRow>
                        <RowContent
                            label='Airtime:'
                            value={ Util.hoursMinutes(airtimeTotal) }
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
