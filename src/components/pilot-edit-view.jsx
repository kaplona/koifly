'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var _ = require('underscore');
var PilotModel = require('../models/pilot');
var Validation = require('../utils/validation');
var Altitude = require('../utils/altitude');
var View = require('./common/view');
var Button = require('./common/button');
var TextInput = require('./common/text-input');
var TimeInput = require('./common/time-input');
var DropDown = require('./common/dropdown');
var Loader = require('./common/loader');
var ErrorBox = require('./common/error-box');
var ErrorTypes = require('../utils/error-types');


var PilotEditView = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            pilot: null,
            errors: _.clone(PilotEditView.formFields),
            loadingError: null,
            savingError: null,
            isSaving: false
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

            PilotModel.savePilotInfo(this.state.pilot).then(() => {
                this.history.pushState(null, '/pilot');
            }).catch((error) => {
                this.handleSavingError(error);
            });
        }
    },

    handleInputChange: function(inputName, inputValue) {
        var newPilotInfo = _.extend({}, this.state.pilot, { [inputName]: inputValue });
        this.setState({ pilot: newPilotInfo }, function() {
            this.validateForm(true);
        });
    },

    handleCancelEditing: function() {
        this.history.pushState(null, '/pilot');
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
            isSaving: false
        });
    },

    handleDataModified: function() {
        // If waiting for server response
        // ignore any other data updates
        if (this.state.isSaving) {
            return;
        }

        // Fetch pilot info
        var pilot = PilotModel.getPilotEditOutput();

        // Check for errors
        if (pilot !== null && pilot.error) {
            this.setState({ loadingError: pilot.error });
            return;
        }

        this.setState({
            pilot: pilot,
            loadingError: null
        });
    },


    validateForm: function(isSoft) {
        var validationResponse = Validation.validateForm(
            PilotModel.getValidationConfig(),
            this.state.pilot,
            isSoft
        );
        this.updateErrorState(validationResponse);
        return validationResponse;
    },

    updateErrorState: function(newErrors) {
        var newErrorState = _.extend({}, PilotEditView.formFields, newErrors);
        this.setState({ errors: newErrorState });
    },

    renderError: function() {
        if (this.state.loadingError !== null) {
            return (
                <View onDataModified={ this.handleDataModified }>
                    <ErrorBox
                        error={ this.state.loadingError }
                        onTryAgain={ this.handleDataModified }
                        />
                </View>
            );
        }
    },

    renderSavingError: function() {
        if (this.state.savingError) {
            var isTrying = this.state.isSaving;
            return (
                <ErrorBox
                    error={ this.state.savingError }
                    onTryAgain={ this.handleSubmit }
                    isTrying={ isTrying }
                    />
            );
        }
    },

    renderLoader: function() {
        return (
            <View onDataModified={ this.handleDataModified }>
                <Loader />
                <div className='button__menu'>
                    <Button active={ false }>Save</Button>
                    <Button onClick={ this.handleCancelEditing }>Cancel</Button>
                </div>
            </View>
        );
    },

    renderButtonMenu: function() {
        var isActive = !this.state.isSaving;
        return (
            <div className='button__menu'>
                <Button type='submit' active={ isActive }>
                    { this.state.isSaving ? 'Saving ...' : 'Save' }
                </Button>
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

        if (this.state.pilot === null) {
            return this.renderLoader();
        }

        var altitudeUnitsList = Altitude.getAltitudeUnitsValueTextList();

        return (
            <View onDataModified={ this.handleDataModified }>
                { this.renderSavingError() }
                <form onSubmit={ this.handleSubmit }>
                    <div className='container__title'>{ this.state.pilot.userName }</div>

                    <div>My achievements before Koifly:</div>

                    <TextInput
                        inputValue={ this.state.pilot.initialFlightNum }
                        labelText='Number of Flights:'
                        inputName='initialFlightNum'
                        errorMessage={ this.state.errors.initialFlightNum }
                        onChange={ this.handleInputChange }
                        />

                    <TimeInput
                        hours={ this.state.pilot.hours }
                        minutes={ this.state.pilot.minutes }
                        labelText='Airtime:'
                        errorMessageHours={ this.state.errors.hours }
                        errorMessageMinutes={ this.state.errors.minutes }
                        onChange={ this.handleInputChange }
                        />

                    <div className='line' />
                    <div>My settings:</div>

                    <DropDown
                        selectedValue={ this.state.pilot.altitudeUnit }
                        options={ altitudeUnitsList }
                        labelText='Altitude unit:'
                        inputName='altitudeUnit'
                        errorMessage={ this.state.errors.altitudeUnit }
                        onChangeFunc={ this.handleInputChange }
                        />

                    { this.renderButtonMenu() }
                </form>
            </View>
        );
    }
});


PilotEditView.formFields = {
    initialFlightNum: null,
    initialAirtime: null,
    altitudeUnit: null,
    hours: null,
    minutes: null
};


module.exports = PilotEditView;
