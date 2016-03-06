'use strict';

var React = require('react');
var History = require('react-router').History;
var DataService = require('../../services/data-service');
var Util = require('../../utils/util');
var PilotModel = require('../../models/pilot');
var View = require('./../common/view');
var TopMenu = require('../common/menu/top-menu');
var BottomMenu = require('../common/menu/bottom-menu');
var Section = require('../common/section/section');
var SectionTitle = require('../common/section/section-title');
var SectionRow = require('../common/section/section-row');
var RowContent = require('../common/section/row-content');
var SectionButton = require('../common/buttons/section-button');
var DaysSinceLastFlight = require('./../common/days-since-last-flight');
var Loader = require('./../common/loader');
var ErrorBox = require('./../common/notice/error-box');


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
                <TopMenu header='Pilot' />
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>
                <BottomMenu isPilotView={ true } />
            </View>
        );
    },

    renderLoader: function() {
        return (
            <View onDataModified={ this.handleDataModified }>
                <TopMenu header='Pilot' />
                <Loader />
                <BottomMenu isPilotView={ true } />
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
                <TopMenu
                    header='Pilot'
                    rightText='Edit'
                    onRightClick={ this.handlePilotEditing }
                    />

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
                        <DaysSinceLastFlight />
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

                <SectionButton
                    text='Change Password'
                    onClick={ this.handleChangePassword }
                    />

                <SectionButton
                    text='Log Out'
                    buttonStyle='warning'
                    onClick={ this.handleLogOut }
                    />

                <BottomMenu isPilotView={ true } />
            </View>
        );
    }
});


module.exports = PilotView;
