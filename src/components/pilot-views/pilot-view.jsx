'use strict';

var React = require('react');
var History = require('react-router').History;

var DataService = require('../../services/data-service');
var PilotModel = require('../../models/pilot');
var Util = require('../../utils/util');

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

    mixins: [ History ],

    getInitialState: function() {
        return {
            pilot: null,
            loadingError: null
        };
    },

    handlePilotEditing: function() {
        this.history.pushState(null, '/pilot/edit');
    },

    handleChangePassword: function(event) {
        if (event) {
            event.preventDefault();
        }
        this.history.pushState(null, '/pilot/edit/change-password');
    },

    handleLogOut: function() {
        DataService.logOut();
        this.history.pushState(null, '/');
    },

    handleDataModified: function() {
        var pilot = PilotModel.getPilotOutput();
        if (pilot !== null && pilot.error) {
            this.setState({ loadingError: pilot.error });
        } else {
            this.setState({
                pilot: pilot,
                loadingError: null
            });
        }
        console.log('handleDataModified => ', pilot);
    },

    renderError: function() {
        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <MobileTopMenu header='Pilot' />
                <NavigationMenu isPilotView={ true } />
                
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified } />
            </View>
        );
    },

    renderLoader: function() {
        return (
            <View onDataModified={ this.handleDataModified }>
                <MobileTopMenu header='Pilot' />
                <NavigationMenu isPilotView={ true } />
                
                <Loader />
            </View>
        );
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.pilot === null) {
            return this.renderLoader();
        }

        var airtimeTotal = Util.hoursMinutes(this.state.pilot.airtimeTotal);

        return (
            <View onDataModified={ this.handleDataModified }>
                <MobileTopMenu
                    header='Pilot'
                    rightButtonCaption='Edit'
                    onRightClick={ this.handlePilotEditing }
                    />
                <NavigationMenu isPilotView={ true } />

                <Section onEditClick={ this.handlePilotEditing }>
                    <SectionTitle>
                        <div>{ this.state.pilot.userName }</div>
                        <div>{ this.state.pilot.email }</div>
                    </SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Flights:'
                            value={ [
                                this.state.pilot.flightNumTotal,
                                '( this year:',
                                this.state.pilot.flightNumThisYear,
                                ')'
                            ].join(' ') }
                            />
                    </SectionRow>
                    
                    <SectionRow>
                        <RowContent
                            label='Airtime:'
                            value={ airtimeTotal }
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
                            value={ <a href='/pilot/edit/change-password' onClick={ this.handleChangePassword }>Change password</a> }
                            />
                    </SectionRow>
                </Section>

                <MobileButton
                    caption='Change Password'
                    onClick={ this.handleChangePassword }
                    />

                <MobileButton
                    caption='Log Out'
                    buttonStyle='warning'
                    onClick={ this.handleLogOut }
                    />
            </View>
        );
    }
});


module.exports = PilotView;
