'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var PubSub = require('../utils/pubsub');
var Util = require('../utils/util');
var Map = require('../utils/map');
var FlightModel = require('../models/flight');
var SiteModel = require('../models/site');
var Button = require('./common/button');
var StaticMap = require('./common/static-map');
var Loader = require('./common/loader');


var FlightView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            flightId: React.PropTypes.string.isRequired
        })
    },

    getInitialState: function() {
        return {
            flight: null
        };
    },

    componentDidMount: function() {
        PubSub.on('dataModified', this.onDataModified, this);
        this.onDataModified();
    },

    componentWillUnmount: function() {
        PubSub.removeListener('dataModified', this.onDataModified, this);
    },

    onDataModified: function() {
        var flight = FlightModel.getFlightOutput(this.props.params.flightId);
        if (flight === false) {
            // TODO if no flight with given id => show error
            return;
        }
        this.setState({ flight: flight });
    },

    renderLoader: function() {
        return (
            <div>
                <Link to='/flights'>Back to Flights</Link>
                <Loader />
                <div className='button__menu'>
                    <Link to={ '/flight/' + this.props.params.flightId + '/edit' }>
                        <Button>Edit</Button>
                    </Link>
                    <Link to='/flight/0/edit'><Button>Add Flight</Button></Link>
                </div>
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
        if (this.state.flight === null) {
            return (<div>{ this.renderLoader() }</div>);
        }

        return (
            <div>
                <Link to='/flights'>Back to Flights</Link>
                <div className='container__title'>
                    <div>{ this.state.flight.date }</div>
                    <div>{ this.state.flight.siteName }</div>
                </div>
                <div className='container__subtitle'>
                    <div>
                        Altitude gained:
                        { this.state.flight.altitude + ' ' + this.state.flight.altitudeUnits }
                    </div>
                    <div>
                        Above the launch:
                        { this.state.flight.altitudeAboveLaunch + ' ' + this.state.flight.altitudeUnits }
                    </div>
                    <div>Airtime: { Util.hoursMinutes(this.state.flight.airtime) }</div>
                    <div>Glider: { this.state.flight.gliderName }</div>
                    <div>Remarks:</div>
                    <div>{ this.state.flight.remarks }</div>
                </div>
                <div className='button__menu'>
                    <Link to={ '/flight/' + this.props.params.flightId + '/edit' }>
                        <Button>Edit</Button>
                    </Link>
                    <Link to='/flight/0/edit'><Button>Add Flight</Button></Link>
                </div>
                { this.renderMap() }
            </div>
        );
    }
});


module.exports = FlightView;
