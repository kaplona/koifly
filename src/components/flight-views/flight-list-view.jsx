'use strict';

var React = require('react');
var History = require('react-router').History;
var FlightModel = require('../../models/flight');
var View = require('./../common/view');
var Table = require('./../common/table');
var Button = require('./../common/button');
var Loader = require('./../common/loader');
var FirstAdding = require('./../common/first-adding');
var ErrorBox = require('./../common/notice/error-box');


var FlightListView = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            flights: null,
            loadingError: null
        };
    },

    handleRowClick: function(flightId) {
        this.history.pushState(null, '/flight/' + flightId);
    },

    handleFlightAdding: function() {
        this.history.pushState(null, '/flight/0/edit');
    },

    handleDataModified: function() {
        var flights = FlightModel.getFlightsArray();
        if (flights !== null && flights.error) {
            this.setState({ loadingError: flights.error });
        } else {
            this.setState({
                flights: flights,
                loadingError: null
            });
        }
    },

    renderError: function() {
        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>
            </View>
        );
    },

    renderNoFlightsYet: function() {
        return (
            <View onDataModified={ this.handleDataModified }>
                <FirstAdding
                    dataType='flights'
                    onAdding={ this.handleFlightAdding }
                    />
            </View>
        );
    },

    renderLoader: function() {
        return (this.state.flights === null) ? <Loader /> : '';
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.flights instanceof Array &&
            this.state.flights.length === 0
        ) {
            return this.renderNoFlightsYet();
        }


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
            <View onDataModified={ this.handleDataModified }>
                <Table
                    columns={ columns }
                    rows={ rows }
                    initialSortingField='date'
                    onRowClick={ this.handleRowClick }
                    />
                { this.renderLoader() }
                <Button onClick={ this.handleFlightAdding }>Add Flight</Button>
            </View>
        );
    }
});


module.exports = FlightListView;
