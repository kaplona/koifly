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
var SectionButton = require('../common/section/section-button');
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

    handleChangePass: function() {
        this.history.pushState(null, '/pilot/edit/change-pass');
    },

    handleLogOut: function() {
        DataService.logOut();
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

                <Section>
                    <SectionTitle>
                        <div>{ this.state.pilot.userName }</div>
                        <div>{ this.state.pilot.email }</div>
                    </SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Flights #:'
                            value={ this.state.pilot.flightNumTotal }
                            />
                    </SectionRow>
                    <SectionRow>
                        <RowContent
                            label='Total Airtime:'
                            value={ airtimeTotal }
                            />
                    </SectionRow>
                    <SectionRow>
                        <RowContent
                            label='Sites #:'
                            value={ this.state.pilot.siteNum }
                            />
                    </SectionRow>
                    <SectionRow>
                        <RowContent
                            label='Gliders #:'
                            value={ this.state.pilot.gliderNum }
                            />
                    </SectionRow>
                    <SectionRow isLast={ true }>
                        <DaysSinceLastFlight />
                    </SectionRow>
                </Section>

                <Section>
                    <SectionTitle>Settings</SectionTitle>

                    <SectionRow isLast={ true }>
                        <RowContent
                            label='Altitude units:'
                            value={ this.state.pilot.altitudeUnit }
                            />
                    </SectionRow>
                </Section>

                <SectionButton
                    text='Change Password'
                    onClick={ this.handleChangePass }
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
