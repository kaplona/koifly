'use strict';

var React = require('react');
var Router = require('react-router');
var History = Router.History;
var Link = Router.Link;
var Util = require('../../utils/util');
var Map = require('../../utils/map');
var FlightModel = require('../../models/flight');
var SiteModel = require('../../models/site');
var View = require('../common/view');
var TopMenu = require('../common/menu/top-menu');
var BottomMenu = require('../common/menu/bottom-menu');
var BreadCrumbs = require('../common/bread-crumbs');
var Section = require('../common/section/section');
var SectionTitle = require('../common/section/section-title');
var SectionRow = require('../common/section/section-row');
var RowContent = require('../common/section/row-content');
var RemarksRow = require('../common/section/remarks-row');
var StaticMap = require('../common/maps/static-map');
var Loader = require('../common/loader');
var ErrorBox = require('../common/notice/error-box');


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

                <Section onEditClick={ this.handleFlightEditing }>
                    <BreadCrumbs>
                        <Link to='/flights'>Flights</Link>
                        { ' / ' + this.state.flight.date }
                        { this.state.flight.flightNumDay ? '(' + this.state.flight.flightNumDay + ')' : '' }
                    </BreadCrumbs>

                    <SectionTitle>
                        <div>{ Util.formatDate(this.state.flight.date) }</div>
                        <div>{ this.state.flight.siteName }</div>
                    </SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Flight number:'
                            value={ [
                                this.state.flight.flightNum,
                                '(',
                                Util.addOrdinalSuffix(this.state.flight.flightNumYear),
                                'for the year )'
                            ].join(' ') }
                            />
                    </SectionRow>
                    <SectionRow>
                        <RowContent
                            label='Max altitude:'
                            value={ this.state.flight.altitude + ' ' + this.state.flight.altitudeUnit }
                            />
                    </SectionRow>
                    <SectionRow>
                        <RowContent
                            label='Above the launch:'
                            value={ this.state.flight.altitudeAboveLaunch + ' ' + this.state.flight.altitudeUnit }
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

                    <RemarksRow value={ this.state.flight.remarks } />

                    { this.renderMap() }
                </Section>

                <BottomMenu isFlightView={ true } />
            </View>
        );
    }
});


module.exports = FlightView;
