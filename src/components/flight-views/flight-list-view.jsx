'use strict';

var React = require('react');
var History = require('react-router').History;
var FlightModel = require('../../models/flight');
var View = require('./../common/view');
var TopMenu = require('../common/menu/top-menu');
var BottomMenu = require('../common/menu/bottom-menu');
var Table = require('./../common/table');
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
        if (this.state.loadingError !== null) {
            return <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified } />;
        }
    },

    renderNoFlightsYet: function() {
        if (this.state.flights instanceof Array &&
            this.state.flights.length === 0
        ) {
            return <FirstAdding dataType='flights' onAdding={ this.handleFlightAdding } />;
        }
    },

    renderLoader: function() {
        return (this.state.flights === null) ? <Loader /> : '';
    },

    renderTable: function() {
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
            <Table
                columns={ columns }
                rows={ rows }
                initialSortingField='date'
                onRowClick={ this.handleRowClick }
                />
        );
    },

    render: function() {
        var content = this.renderError();

        if (!content) {
            content = this.renderNoFlightsYet();
        }

        if (!content) {
            content = this.renderTable();
        }

        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <TopMenu
                    headerText='Flights'
                    rightText='+'
                    onRightClick={ this.handleFlightAdding }
                    />

                { content }
                { this.renderLoader() }

                <BottomMenu isFlightView={ true } />
            </View>
        );
    }
});


module.exports = FlightListView;
