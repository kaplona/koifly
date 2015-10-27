'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var FlightModel = require('../models/flight');
var View = require('./common/view');
var Table = require('./common/table');
var Button = require('./common/button');
var Loader = require('./common/loader');


var FlightListView = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            flights: null
        };
    },

    handleRowClick: function(flightId) {
        this.history.pushState(null, '/flight/' + flightId);
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
            <View onDataModified={ this.onDataModified }>
                <Table
                    columns={ columns }
                    rows={ rows }
                    initialSortingField='date'
                    onRowClick={ this.handleRowClick }
                    />
                { this.renderLoader() }
                <Link to='/flight/0/edit'><Button>Add Flight</Button></Link>
            </View>
        );
    }
});


module.exports = FlightListView;
