'use strict';

var React = require('react');
var Router = require('react-router');
var History = Router.History;
var Link = Router.Link;

const ZOOM_LEVEL = require('../../constants/map-constants').ZOOM_LEVEL;

var FlightModel = require('../../models/flight');
var SiteModel = require('../../models/site');
var Util = require('../../utils/util');

var BreadCrumbs = require('../common/bread-crumbs');
var ErrorBox = require('../common/notice/error-box');
var Loader = require('../common/loader');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var RemarksRow = require('../common/section/remarks-row');
var RowContent = require('../common/section/row-content');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var StaticMap = require('../common/maps/static-map');
var View = require('../common/view');


var FlightView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({ // url args
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
                <MobileTopMenu
                    leftButtonCaption='Back'
                    onLeftClick={ this.handleToFlightList }
                    />
                <NavigationMenu isFlightView={ true } />
                
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>
            </View>
        );
    },

    renderLoader: function() {
        return (
            <View onDataModified={ this.handleDataModified }>
                <MobileTopMenu
                    leftButtonCaption='Back'
                    onLeftClick={ this.handleToFlightList }
                    />
                <NavigationMenu isFlightView={ true } />
                
                <Loader />
            </View>
        );
    },

    renderMap: function() {
        var siteId = this.state.flight.siteId;
        var siteCoordinates = SiteModel.getLatLngCoordinates(siteId);
        // this flight has no site or the site has no coordinates
        if (siteCoordinates === null) {
            return null;
        }

        var site = SiteModel.getSiteOutput(siteId);
        
        return StaticMap.create({
            center: siteCoordinates,
            zoomLevel: ZOOM_LEVEL.site,
            sites: [ site ]
        });
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.flight === null) {
            return this.renderLoader();
        }

        var flightName = this.state.flight.date + ' (' + this.state.flight.flightNumDay + '/' + this.state.flight.numOfFlightsThatDay + ')';
        

        return (
            <View onDataModified={ this.handleDataModified }>
                <MobileTopMenu
                    leftButtonCaption='Back'
                    rightButtonCaption='Edit'
                    onLeftClick={ this.handleToFlightList }
                    onRightClick={ this.handleFlightEditing }
                    />
                <NavigationMenu isFlightView={ true } />

                <Section onEditClick={ this.handleFlightEditing }>
                    <BreadCrumbs
                        elements={ [
                            <Link to='/flights'>Flights</Link>,
                            flightName
                        ] }
                        />

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
            </View>
        );
    }
});


module.exports = FlightView;
