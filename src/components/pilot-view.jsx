'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var PubSub = require('../utils/pubsub');
var Util = require('../utils/util');
var PilotModel = require('../models/pilot');
var Button = require('./common/button');
var DaysSinceLastFlight = require('./common/days-since-last-flight');
var Loader = require('./common/loader');


var PilotView = React.createClass({

    getInitialState: function() {
        return {
            pilot: null
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
        var pilot = PilotModel.getPilotOutput();
        this.setState({ pilot: pilot });
    },

    render: function() {
        if (this.state.pilot === null) {
            return <Loader />;
        }

        var airtimeTotal = Util.hoursMinutes(this.state.pilot.airtimeTotal);

        return (
            <div>
                <div className='container__title'>{ this.state.pilot.userName }</div>
                <div className='container__subtitle'>
                    <div>Flights #: { this.state.pilot.flightNumTotal }</div>
                    <div>Total Airtime: { airtimeTotal }</div>
                    <div>Sites #: { this.state.pilot.siteNum }</div>
                    <div>Gliders #: { this.state.pilot.gliderNum }</div>
                    <DaysSinceLastFlight />
                </div>

                <div className='line' />

                <div className='container__title'>Settings</div>
                <div className='container__subtitle'>
                    Altitude units: { this.state.pilot.altitudeUnits }
                </div>

                <Link to='/pilot/edit'><Button>Edit</Button></Link>
            </div>
        );
    }
});


module.exports = PilotView;
