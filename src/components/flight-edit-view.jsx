'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var _ = require('underscore');
var FlightModel = require('../models/flight');
var SiteModel = require('../models/site');
var GliderModel = require('../models/glider');
var Validation = require('../utils/validation');
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
            savingError: null,
            deletingError: null,
            isSaving: false,
            isDeleting: false
        };
    },

    handleSubmit: function(event) {
        if (event) {
            event.preventDefault();
        }

        var validationResponse = this.validateForm();
        // If no errors
        if (validationResponse === true) {
            this.setState({ isSaving: true });

            FlightModel.saveFlight(this.state.flight).then(() => {
                this.history.pushState(null, '/flights');
            }).catch((error) => {
                this.handleSavingError(error);
            });
        }
    },

    handleDeleteFlight: function() {
        this.setState({ isDeleting: true });
        FlightModel.deleteFlight(this.props.params.flightId).then(() => {
            this.history.pushState(null, '/flights');
        }).catch((error) => {
            this.handleDeletingError(error);
        });
    },

    handleInputChange: function(inputName, inputValue) {
        var newFlight = _.extend({}, this.state.flight, { [inputName]: inputValue });
        this.setState({ flight: newFlight }, () => {
            this.validateForm(true);
        });
    },

    handleCancelEditing: function() {
        this.history.pushState(
            null,
            this.props.params.flightId ? ('/flight/' + this.props.params.flightId) : '/flights'
        );
    },

    handleSavingError: function(error) {
        var newError = null;
        if (error.type === ErrorTypes.VALIDATION_FAILURE) {
            this.updateErrorState(error.errors);
        } else {
            newError = error;
        }

        this.setState({
            savingError: newError,
            deletingError: null,
            isSaving: false,
            isDeleting: false
        });
    },

    handleDeletingError: function(error) {
        this.setState({
            deletingError: error,
            savingError: null,
            isDeleting: false,
            isSaving: false
        });
    },

    handleDataModified: function() {
        // If waiting for server response
        // ignore any other data updates
        if (this.state.isSaving || this.state.isDeleting) {
            return;
        }

        // Fetch flight
        var flight = FlightModel.getFlightEditOutput(this.props.params.flightId);

        // Check for errors
        if (flight !== null && flight.error) {
            this.setState({ loadingError: flight.error });
            return;
        }

        this.setState({
            flight: flight,
            loadingError: null
        });
    },

    validateForm: function(isSoft) {
        // Clone state object to enforce immutability
        var validationResponse = Validation.validateForm(
            FlightModel.getValidationConfig(),
            this.state.flight,
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
        return (
            <View onDataModified={ this.handleDataModified }>
                <ErrorBox
                    error={ this.state.loadingError }
                    onTryAgain={ this.handleDataModified }
                    />
            </View>
        );
    },

    renderSavingError: function() {
        if (this.state.savingError) {
            var isTrying = (this.state.isSaving || this.state.isDeleting);
            return (
                <ErrorBox
                    error={ this.state.savingError }
                    onTryAgain={ this.handleSubmit }
                    isTrying={ isTrying }
                    />
            );
        }
    },

    renderDeletingError: function() {
        if (this.state.deletingError) {
            var isTrying = (this.state.isSaving || this.state.isDeleting);
            return (
                <ErrorBox
                    error={ this.state.deletingError }
                    onTryAgain={ this.handleDeleteFlight }
                    isTrying={ isTrying }
                    />
            );
        }
    },

    renderLoader: function() {
        var deleteButton = (this.props.params.flightId) ? <Button active={ false }>Delete</Button> : '';
        return (
            <View onDataModified={ this.handleDataModified }>
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
            var isActive = (!this.state.isSaving && !this.state.isDeleting);
            return (
                <Button onClick={ this.handleDeleteFlight } active={ isActive }>
                    { this.state.isDeleting ? 'Deleting ...' : 'Delete' }
                </Button>
            );
        }
    },

    renderButtonMenu: function() {
        var isActive = (!this.state.isSaving && !this.state.isDeleting);
        return (
            <div className='button__menu'>
                <Button type='submit' active={ isActive }>
                    { this.state.isSaving ? 'Saving ...' : 'Save' }
                </Button>
                { this.renderDeleteButton() }
                <Button onClick={ this.handleCancelEditing } active={ isActive }>
                    Cancel
                </Button>
            </div>
        );
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.flight === null) {
            return this.renderLoader();
        }

        var sites = SiteModel.getSiteValueTextList();
        var gliders = GliderModel.getGliderValueTextList();

        return (
            <View onDataModified={ this.handleDataModified }>
                <Link to='/flights'>Back to Flights</Link>
                { this.renderSavingError() }
                { this.renderDeletingError() }
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
                        errorMessage={ this.state.errors.airtime }
                        errorMessageHours={ this.state.errors.hours }
                        errorMessageMinutes={ this.state.errors.minutes }
                        onChange={ this.handleInputChange }
                        />

                    <AltitudeInput
                        inputValue={ this.state.flight.altitude }
                        selectedAltitudeUnit={ this.state.flight.altitudeUnit }
                        labelText='Altitude gained:'
                        errorMessage={ this.state.errors.altitude }
                        onChange={ this.handleInputChange }
                        />

                    <DropDown
                        selectedValue={ this.state.flight.siteId === null ? '0' : this.state.flight.siteId }
                        options={ sites }
                        labelText='Site:'
                        inputName='siteId'
                        emptyValue={ 0 }
                        errorMessage={ this.state.errors.siteId }
                        onChangeFunc={ (inputName, inputValue) => {
                            this.handleInputChange(inputName, inputValue === '0' ? null : inputValue);
                        } }
                        />

                    <DropDown
                        selectedValue={ this.state.flight.gliderId === null ? '0' : this.state.flight.gliderId }
                        options={ gliders }
                        labelText='Glider:'
                        inputName='gliderId'
                        emptyValue={ 0 }
                        errorMessage={ this.state.errors.gliderId }
                        onChangeFunc={ (inputName, inputValue) => {
                            this.handleInputChange(inputName, inputValue === '0' ? null : inputValue);
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
    airtime: null,
    gliderId: null,
    remarks: null,
    hours: null,
    minutes: null
};


module.exports = FlightEditView;
