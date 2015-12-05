'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var History = ReactRouter.History;
var Util = require('../utils/util');
var Map = require('../utils/map');
var FlightModel = require('../models/flight');
var SiteModel = require('../models/site');
var View = require('./common/view');
var Button = require('./common/button');
var StaticMap = require('./common/static-map');
var Loader = require('./common/loader');
var ErrorBox = require('./common/error-box');


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

    handleFlightEditing: function() {
        this.history.pushState(null, '/flight/' + this.props.params.flightId + '/edit');
    },

    handleFlightAdding: function() {
        this.history.pushState(null, '/flight/0/edit');
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
            <View onDataModified={ this.handleDataModified }>
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>
            </View>
        );
    },

    renderLoader: function() {
        return (
            <View onDataModified={ this.handleDataModified }>
                <Link to='/flights'>Back to Flights</Link>
                <Loader />
                { this.renderButtonMenu() }
            </View>
        );
    },

    renderButtonMenu: function() {
        return (
            <div className='button__menu'>
                <Button onClick={ this.handleFlightEditing }>Edit</Button>
                <Button onClick={ this.handleFlightAdding }>Add Flight</Button>
            </div>
        );
    },

    renderMap: function() {
        var siteId = this.state.flight.siteId;
        if (siteId !== null) {
            var siteList = [];
            siteList.push(SiteModel.getSiteOutput(this.state.flight.siteId));
            return (
                <StaticMap
                    center={ SiteModel.getLatLngCoordinates(siteId) }
                    zoomLevel={ Map.zoomLevel.site }
                    markers={ siteList }
                    />
            );
        }
        return '';
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
                <Link to='/flights'>Back to Flights</Link>
                <div className='container__title'>
                    <div>{ this.state.flight.date }</div>
                    <div>{ this.state.flight.siteName }</div>
                </div>
                <div className='container__subtitle'>
                    <div>
                        Altitude gained:
                        { this.state.flight.altitude + ' ' + this.state.flight.altitudeUnit }
                    </div>
                    <div>
                        Above the launch:
                        { this.state.flight.altitudeAboveLaunch + ' ' + this.state.flight.altitudeUnit }
                    </div>
                    <div>Airtime: { Util.hoursMinutes(this.state.flight.airtime) }</div>
                    <div>Glider: { this.state.flight.gliderName }</div>
                    <div>Remarks:</div>
                    <div>{ this.state.flight.remarks }</div>
                </div>
                { this.renderButtonMenu() }
                { this.renderMap() }
            </View>
        );
    }
});


module.exports = FlightView;
