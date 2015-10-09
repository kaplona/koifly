'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var PubSub = require('../models/pubsub');
var FlightModel = require('../models/flight');
var Table = require('./common/table');
var Button = require('./common/button');
var Loader = require('./common/loader');


var FlightListView = React.createClass({

    getInitialState: function() {
        return {
            flights: null
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
        var flights = FlightModel.getFlightsArray();
        this.setState({ flights: flights });
    },

    renderLoader: function() {
        return (this.state.flights === null) ? <Loader /> : '';
    },

    render: function() {
        var columns = [
            {
                key: 'date',
                label: 'Date',
                defaultSortingDirection: false
            },
            {
                key: 'siteName',
                label: 'Site',
                defaultSortingDirection: true
            },
            {
                key: 'altitude',
                label: 'Altitude',
                defaultSortingDirection: false
            },
            {
                key: 'airtime',
                label: 'Airtime',
                defaultSortingDirection: false
            }
        ];

        var rows = (this.state.flights !== null) ? this.state.flights : [];

        return (
            <div>
                <Table
                    columns={ columns }
                    rows={ rows }
                    initialSortingField='date'
                    urlPath='/flight/'
                    />
                { this.renderLoader() }
                <Link to='/flight/0/edit'><Button>Add Flight</Button></Link>
            </div>
        );
    }
});


module.exports = FlightListView;



