'use strict';

var React = require('react');
var History = require('react-router').History;

var FlightModel = require('../../models/flight');

var Button = require('../common/buttons/button');
var DesktopTopGrid = require('../common/grids/desktop-top-grid');
var ErrorBox = require('../common/notice/error-box');
var FirstAdding = require('../common/first-adding');
var Loader = require('../common/loader');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var Section = require('../common/section/section');
var Table = require('../common/table');
var View = require('../common/view');


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

    renderAddFlightButton: function() {
        return <Button caption='Add Flight' onClick={ this.handleFlightAdding } />;
    },

    renderLoader: function() {
        return (this.state.flights === null) ? <Loader /> : null;
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
        
        return (
            <Table
                columns={ columns }
                rows={ this.state.flights || [] }
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
                <MobileTopMenu
                    header='Flights'
                    rightButtonCaption='Add'
                    onRightClick={ this.handleFlightAdding }
                    />
                <NavigationMenu isFlightView={ true } />
                
                <Section>
                    <DesktopTopGrid
                        leftElement={ this.renderAddFlightButton() }
                        />

                    { content }
                    
                    { this.renderLoader() }
                </Section>
            </View>
        );
    }
});


module.exports = FlightListView;
