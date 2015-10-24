'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var $ = require('jquery');
var _ = require('underscore');
var PubSub = require('../utils/pubsub');
var FlightModel = require('../models/flight');
var SiteModel = require('../models/site');
var GliderModel = require('../models/glider');
var Validation = require('../utils/validation');
var Button = require('./common/button');
var TextInput = require('./common/text-input');
var TimeInput = require('./common/time-input');
var AltitudeInput = require('./common/altitude-input');
var RemarksInput = require('./common/remarks-input');
var DropDown = require('./common/dropdown');
var Loader = require('./common/loader');


var FlightEditView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            flightId: React.PropTypes.string
        })
    },

    mixins: [ History ],

    getInitialState: function() {
        return {
            flight: null,
            errors: {
                date: '',
                siteId: '',
                altitude: '',
                altitudeUnits: '',
                airtime: '',
                gliderId: '',
                remarks: '',
                hours: '',
                minutes: ''
            }
        };
    },

    componentDidMount: function() {
        PubSub.on('dataModified', this.onDataModified, this);
        this.onDataModified();
    },

    componentWillUnmount: function() {
        PubSub.removeListener('dataModified', this.onDataModified, this);
    },

    handleSubmit: function(e) {
        e.preventDefault();
        var validationRespond = this.validateForm();
        // If no errors
        if (validationRespond === true) {
            var newFlight =  _.clone(this.state.flight);
            newFlight.airtime = parseInt(newFlight.hours) * 60 + parseInt(newFlight.minutes);
            newFlight.siteId = (newFlight.siteId === 'other') ? null : newFlight.siteId;
            newFlight.gliderId = (newFlight.gliderId === 'other') ? null : newFlight.gliderId;
            FlightModel.saveFlight(newFlight);
            this.history.pushState(null, '/flights');
        }
    },

    handleInputChange: function(inputName, inputValue) {
        var newFlight =  _.clone(this.state.flight);
        newFlight[inputName] = inputValue;
        this.setState({ flight: newFlight }, () => {
            this.validateForm(true);
        });
    },

    handleDeleteFlight: function() {
        FlightModel.deleteFlight(this.props.params.flightId);
    },

    onDataModified: function() {
        var flight;
        if (this.props.params.flightId) {
            flight = FlightModel.getFlightOutput(this.props.params.flightId);
        } else {
            flight = FlightModel.getNewFlightOutput();
        }

        if (flight === false) {
            // TODO if no flight with given id => show error
            return;
        }
        if (flight !== null) {
            flight.siteId = (flight.siteId === null) ? 'other' : flight.siteId;
            flight.gliderId = (flight.gliderId === null) ? 'other' : flight.gliderId;
            flight.hours = Math.floor(flight.airtime / 60);
            flight.minutes = flight.airtime % 60;
        }
        this.setState({ flight: flight });
    },

    validateForm: function(softValidation) {
        var newFlight =  _.clone(this.state.flight);
        var validationRespond = Validation.validateForm(
            FlightModel.getValidationConfig(),
            newFlight,
            softValidation
        );
        // update errors state
        var newErrorState =  _.clone(this.state.errors);
        $.each(newErrorState, (fieldName) => {
            newErrorState[fieldName] = validationRespond[fieldName] ? validationRespond[fieldName] : '';
        });
        this.setState({ errors: newErrorState });

        return validationRespond;
    },

    renderLoader: function() {
        var deleteButton = (this.props.params.flightId) ? <Button active={ false }>Delete</Button> : '';
        return (
            <div>
                <Link to='/flights'>Back to Flights</Link>
                <Loader />
                <div className='button__menu'>
                    <Button active={ false }>Save</Button>
                    { deleteButton }
                    <Link to={ this.props.params.flightId ? ('/flight/' + this.props.params.flightId) : '/flights' }>
                        <Button>Cancel</Button>
                    </Link>
                </div>
            </div>
        );
    },

    renderSelectOptions: function(initialData) {
        var options = [];
        $.each(initialData, (dataId, dataValue) => {
            options.push({ value: dataId, text: dataValue });
        });
        options.push({ value: 'other', text: 'other' });
        return options;
    },

    renderDeleteButton: function() {
        if (this.props.params.flightId) {
            return (
                <Link to='/flights'>
                    <Button onClick={ this.handleDeleteFlight }>Delete</Button>
                </Link>
            );
        }
        return '';
    },

    render: function() {
        if (this.state.flight === null) {
            return (<div>{ this.renderLoader() }</div>);
        }

        var sites = SiteModel.getSiteSimpleList();
        var gliders = GliderModel.getGliderSimpleList();

        return (
            <div>
                <Link to='/flights'>Back to Flights</Link>
                <form onSubmit={ this.handleSubmit }>
                    <TextInput
                        inputValue={ this.state.flight.date }
                        labelText={ <span>Date<sup>*</sup>:</span> }
                        errorMessage={ this.state.errors.date }
                        onChange={ this.handleInputChange.bind(this, 'date') }
                        />

                    <TimeInput
                        hours={ this.state.flight.hours }
                        minutes={ this.state.flight.minutes }
                        labelText='Airtime:'
                        errorMessageHours={ this.state.errors.hours }
                        errorMessageMinutes={ this.state.errors.minutes }
                        onChange={ this.handleInputChange }
                        />

                    <AltitudeInput
                        inputValue={ this.state.flight.altitude }
                        selectedAltitudeUnits={ this.state.flight.altitudeUnits }
                        labelText='Altitude gained:'
                        errorMessage={ this.state.errors.altitude }
                        onChange={ this.handleInputChange }
                        />

                    <DropDown
                        selectedValue={ this.state.flight.siteId }
                        options={ this.renderSelectOptions(sites) }
                        labelText='Site:'
                        errorMessage={ this.state.errors.siteId }
                        onChangeFunc={ this.handleInputChange.bind(this, 'siteId') }
                        />

                    <DropDown
                        selectedValue={ this.state.flight.gliderId }
                        options={ this.renderSelectOptions(gliders) }
                        labelText='Gliger:'
                        errorMessage={ this.state.errors.gliderId }
                        onChangeFunc={ this.handleInputChange.bind(this, 'gliderId') }
                        />

                    <RemarksInput
                        inputValue={ this.state.flight.remarks }
                        labelText='Remarks'
                        onChange={ this.handleInputChange.bind(this, 'remarks') }
                        />

                    <div className='button__menu'>
                        <Button type='submit'>Save</Button>
                        { this.renderDeleteButton() }
                        <Link to={ this.props.params.flightId ? ('/flight/' + this.props.params.flightId) : '/flights' }>
                            <Button>Cancel</Button>
                        </Link>
                    </div>
                </form>
            </div>
        );
    }
});


module.exports = FlightEditView;
