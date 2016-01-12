'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Util = require('../../utils/util');
var Map = require('../../utils/map');
var FlightModel = require('../../models/flight');
var SiteModel = require('../../models/site');
var View = require('./../common/view');
var TopMenu = require('../common/menu/top-menu');
var BottomMenu = require('../common/menu/bottom-menu');
var Section = require('../common/section/section');
var SectionTitle = require('../common/section/section-title');
var SectionRow = require('../common/section/section-row');
var RowContent = require('../common/section/row-content');
var StaticMap = require('./../common/maps/static-map');
var Loader = require('./../common/loader');
var ErrorBox = require('./../common/notice/error-box');


var FlightView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            flightId: React.PropTypes.string.isRequired
        })
    },

    mixins: [ History ],

    getInitialState: function() {
        return {
            flight: null,
            loadingError: null
        };
    },

    handleToFlightList: function() {
        this.history.pushState(null, '/flights');
    },

    handleFlightEditing: function() {
        this.history.pushState(null, '/flight/' + this.props.params.flightId + '/edit');
    },

    handleDataModified: function() {
        var flight = FlightModel.getFlightOutput(this.props.params.flightId);
        if (flight !== null && flight.error) {
            this.setState({ loadingError: flight.error });
        } else {
            this.setState({
                flight: flight,
                loadingError: null
            });
        }
    },

    renderError: function() {
        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <TopMenu
                    leftText='Back'
                    onLeftClick={ this.handleToFlightList }
                    />
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>
                <BottomMenu isFlightView={ true } />
            </View>
        );
    },

    renderLoader: function() {
        return (
            <View onDataModified={ this.handleDataModified }>
                <TopMenu
                    leftText='Back'
                    onLeftClick={ this.handleToFlightList }
                    />
                <Loader />
                <BottomMenu isFlightView={ true } />
            </View>
        );
    },

    renderMap: function() {
        var siteId = this.state.flight.siteId;
        var siteCoordinates = SiteModel.getLatLngCoordinates(siteId);
        if (siteCoordinates === null) {
            return null;
        }

        var site = SiteModel.getSiteOutput(siteId);
        var siteList = [ site ];
        return (
            <StaticMap
                center={ siteCoordinates }
                zoomLevel={ Map.zoomLevel.site }
                markers={ siteList }
                />
        );
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.flight === null) {
            return this.renderLoader();
        }

        return (
            <View onDataModified={ this.handleDataModified }>
                <TopMenu
                    leftText='Back'
                    rightText='Edit'
                    onLeftClick={ this.handleToFlightList }
                    onRightClick={ this.handleFlightEditing }
                    />

                <Section>
                    <SectionTitle>
                        <div>{ this.state.flight.date }</div>
                        <div>{ this.state.flight.siteName }</div>
                    </SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Altitude gained:'
                            value={ ' ' + this.state.flight.altitude + ' ' + this.state.flight.altitudeUnit }
                            />
                    </SectionRow>
                    <SectionRow>
                        <RowContent
                            label='Above the launch:'
                            value={ ' ' + this.state.flight.altitudeAboveLaunch + ' ' + this.state.flight.altitudeUnit }
                            />
                    </SectionRow>
                    <SectionRow>
                        <RowContent
                            label='Airtime:'
                            value={ Util.hoursMinutes(this.state.flight.airtime) }
                            />
                    </SectionRow>
                    <SectionRow>
                        <RowContent
                            label='Glider:'
                            value={ this.state.flight.gliderName }
                            />
                    </SectionRow>
                    <SectionRow>
                        <div>Remarks:</div>
                        <div>{ this.state.flight.remarks }</div>
                    </SectionRow>

                    { this.renderMap() }
                </Section>

                <BottomMenu isFlightView={ true } />
            </View>
        );
    }
});


module.exports = FlightView;
