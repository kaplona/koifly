'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
//var $ = require('jquery');
var _ = require('underscore');
var FlightModel = require('../models/flight');
var SiteModel = require('../models/site');
var GliderModel = require('../models/glider');
var Validation = require('../utils/validation');
var Util = require('../utils/util');
var View = require('./common/view');
var Button = require('./common/button');
var TextInput = require('./common/text-input');
var TimeInput = require('./common/time-input');
var AltitudeInput = require('./common/altitude-input');
var RemarksInput = require('./common/remarks-input');
var DropDown = require('./common/dropdown');
var Loader = require('./common/loader');
var ErrorBox = require('./common/error-box');
var ErrorTypes = require('../utils/error-types');


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
            errors: _.clone(FlightEditView.formFields),
            loadingError: null,
            savingInProcess: false
        };
    },

    handleSubmit: function(e) {
        e.preventDefault();
        var validationResponse = this.validateForm();
        // If no errors
        if (validationResponse === true) {
            this.setState({ savingInProcess: true });
            // Prepare data for sending to the server
            var newFlight =  _.clone(this.state.flight);
            newFlight.airtime = parseInt(newFlight.hours) * 60 + parseInt(newFlight.minutes);
            newFlight.siteId = (newFlight.siteId === 'other') ? null : newFlight.siteId;
            newFlight.gliderId = (newFlight.gliderId === 'other') ? null : newFlight.gliderId;

            FlightModel.saveFlight(newFlight).then(() => {
                this.history.pushState(null, '/flights');
            }).catch((error) => {
                this.handleSavingError(error);
            });
        }
    },

    handleInputChange: function(inputName, inputValue) {
        var newFlight = _.extend({}, this.state.flight, { [inputName]: inputValue });
        this.setState({ flight: newFlight }, () => {
            this.validateForm(true);
        });
    },

    handleDeleteFlight: function() {
        this.setState({ savingInProcess: true });
        FlightModel.deleteFlight(this.props.params.flightId).then(() => {
            this.history.pushState(null, '/flights');
        }).catch((error) => {
            this.handleSavingError(error);
        });
    },

    handleCancelEditing: function() {
        this.history.pushState(
            null,
            this.props.params.flightId ? ('/flight/' + this.props.params.flightId) : '/flights'
        );
    },

    handleSavingError: function(error) {
        var loadingError = null;
        if (error.type === ErrorTypes.VALIDATION_FAILURE) {
            this.updateErrorState(error.errors);
        } else {
            loadingError = error;
        }
        this.setState({
            loadingError: loadingError,
            savingInProcess: false
        });
    },

    onDataModified: function() {
        // If waiting for server response
        // ignore any other data updates
        if (this.state.savingInProcess) {
            return;
        }

        // Fetch flight
        var flight;
        if (this.props.params.flightId) {
            flight = FlightModel.getFlightOutput(this.props.params.flightId);
        } else {
            flight = FlightModel.getNewFlightOutput();
        }

        // Check for errors
        if (flight !== null && flight.error) {
            // Create an empty flight
            // in order to show to user an empty form
            // if error occurred
            var newFlight = this.state.flight;
            if (newFlight === null) {
                newFlight = this.createBlanckFlight();
            }
            this.setState({
                flight: newFlight,
                loadingError: flight.error
            });
            return;
        }

        // Prepare flight info for user presentation
        if (flight !== null) {
            flight.siteId = (flight.siteId === null) ? 'other' : flight.siteId;
            flight.gliderId = (flight.gliderId === null) ? 'other' : flight.gliderId;
            flight.hours = Math.floor(flight.airtime / 60);
            flight.minutes = flight.airtime % 60;
        }

        this.setState({
            flight: flight,
            loadingError: null
        });
    },

    createBlanckFlight: function() {
        return {
            date: Util.today(),
            siteId: 'other',
            altitude: 0,
            altitudeUnits: 'meter',
            airtime: 0,
            gliderId: 'other',
            remarks: '',
            hours: 0,
            minutes: 0
        };
    },

    validateForm: function(isSoft) {
        // Clone state object to enforce immutability
        var newFlight =  _.clone(this.state.flight);
        var validationResponse = Validation.validateForm(
            FlightModel.getValidationConfig(),
            newFlight,
            isSoft
        );
        this.updateErrorState(validationResponse);
        return validationResponse;
    },

    updateErrorState: function(newErrors) {
        var newErrorState = _.extend({}, FlightEditView.formFields, newErrors);
        this.setState({ errors: newErrorState });
    },

    renderError: function() {
        if (this.state.loadingError !== null) {
            return <ErrorBox error={ this.state.loadingError }/>;
        }
        return '';
    },

    renderLoader: function() {
        var deleteButton = (this.props.params.flightId) ? <Button active={ false }>Delete</Button> : '';
        return (
            <View onDataModified={ this.onDataModified }>
                <Link to='/flights'>Back to Flights</Link>
                <Loader />
                <div className='button__menu'>
                    <Button active={ false }>Save</Button>
                    { deleteButton }
                    <Button onClick={ this.handleCancelEditing }>Cancel</Button>
                </div>
            </View>
        );
    },

    renderDeleteButton: function() {
        if (this.props.params.flightId) {
            var buttonText = this.state.savingInProcess ? '...' : 'Delete';
            return (
                <Button
                    onClick={ this.handleDeleteFlight }
                    active={ !this.state.savingInProcess }
                    >
                    { buttonText }
                </Button>
            );
        }
    },

    renderButtonMenu: function() {
        var saveButtonText = this.state.savingInProcess ? '...' : 'Save';
        var cancelButtonText = this.state.savingInProcess ? '...' : 'Cancel';
        return (
            <div className='button__menu'>
                <Button type='submit' active={ !this.state.savingInProcess }>
                    { saveButtonText }
                </Button>
                { this.renderDeleteButton() }
                <Button active={ !this.state.savingInProcess } onClick={ this.handleCancelEditing }>
                    { cancelButtonText }
                </Button>
            </div>
        );
    },

    render: function() {
        if (this.state.flight === null) {
            return this.renderLoader();
        }

        var sites = SiteModel.getSiteValueTextList();
        var gliders = GliderModel.getGliderValueTextList();

        return (
            <View onDataModified={ this.onDataModified }>
                <Link to='/flights'>Back to Flights</Link>
                { this.renderError() }
                <form onSubmit={ this.handleSubmit }>
                    <TextInput
                        inputValue={ this.state.flight.date }
                        labelText={ <span>Date<sup>*</sup>:</span> }
                        inputName='date'
                        errorMessage={ this.state.errors.date }
                        onChange={ this.handleInputChange }
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
                        selectedAltitudeUnit={ this.state.flight.altitudeUnits }
                        labelText='Altitude gained:'
                        errorMessage={ this.state.errors.altitude }
                        onChange={ this.handleInputChange }
                        />

                    <DropDown
                        selectedValue={ this.state.flight.siteId === null ? 0 : this.state.flight.siteId }
                        options={ sites }
                        labelText='Site:'
                        inputName='siteId'
                        emptyValue={ 0 }
                        errorMessage={ this.state.errors.siteId }
                        onChangeFunc={ (inputName, inputValue) => {
                            this.handleInputChange(inputName, inputValue === 0 ? null : inputValue);
                        } }
                        />

                    <DropDown
                        selectedValue={ this.state.flight.gliderId === null ? 0 : this.state.flight.gliderId }
                        options={ gliders }
                        labelText='Glider:'
                        inputName='gliderId'
                        emptyValue={ 0 }
                        errorMessage={ this.state.errors.gliderId }
                        onChangeFunc={ (inputName, inputValue) => {
                            this.handleInputChange(inputName, inputValue === 0 ? null : inputValue);
                        } }
                        />

                    <RemarksInput
                        inputValue={ this.state.flight.remarks }
                        labelText='Remarks'
                        errorMessage={ this.state.errors.remarks }
                        onChange={ this.handleInputChange }
                        />

                    { this.renderButtonMenu() }
                </form>
            </View>
        );
    }
});


FlightEditView.formFields = {
    date: null,
    siteId: null,
    altitude: null,
    altitudeUnits: null,
    airtime: null,
    gliderId: null,
    remarks: null,
    hours: null,
    minutes: null
};


module.exports = FlightEditView;
