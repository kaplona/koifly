'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
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
            savingInProcess: false
        };
    },

    handleSubmit: function(e) {
        e.preventDefault();
        var validationResponse = this.validateForm();
        // If no errors
        if (validationResponse === true) {
            this.setState({ savingInProcess: true });
            var newPilotInfo =  _.clone(this.state.pilot);
            newPilotInfo.initialAirtime = parseInt(newPilotInfo.hours) * 60 + parseInt(newPilotInfo.minutes);
            PilotModel.savePilotInfo(newPilotInfo).then(() => {
                this.history.pushState(null, '/pilot');
            }).catch((error) => {
                this.handleSavingError(error);
            });
        }
    },

    handleInputChange: function(inputName, inputValue) {
        var newPilotInfo =  _.clone(this.state.pilot);
        newPilotInfo[inputName] = inputValue;
        this.setState({ pilot: newPilotInfo }, function() {
            this.validateForm(true);
        });
    },

    handleCancelEditing: function() {
        this.history.pushState(null, '/pilot');
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

        // Fetch pilot info
        var pilot = PilotModel.getPilotEditOutput();

        // Check for errors
        if (pilot !== null && pilot.error) {
            this.setState({
                loadingError: pilot.error
            });
            return;
        }

        if (pilot !== null) {
            pilot.hours = Math.floor(pilot.initialAirtime / 60);
            pilot.minutes = pilot.initialAirtime % 60;
        }

        this.setState({
            pilot: pilot,
            loadingError: null
        });
    },


    validateForm: function(softValidation) {
        var newPilotInfo =  _.clone(this.state.pilot);
        var validationResponse = Validation.validateForm(
                PilotModel.getValidationConfig(),
                newPilotInfo,
                softValidation
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
            return <ErrorBox error={ this.state.loadingError }/>;
        }
        return '';
    },

    renderLoader: function() {
        return (
            <View onDataModified={ this.onDataModified }>
                <Loader />
                <div className='button__menu'>
                    <Button active={ false }>Save</Button>
                    <Link to='/pilot'><Button>Cancel</Button></Link>
                </div>
            </View>
        );
    },

    renderButtonMenu: function() {
        var saveButtonText = this.state.savingInProcess ? '...' : 'Save';
        var cancelButtonText = this.state.savingInProcess ? '...' : 'Cancel';
        return (
            <div className='button__menu'>
                <Button type='submit' active={ !this.state.savingInProcess }>
                    { saveButtonText }
                </Button>
                <Button active={ !this.state.savingInProcess } onClick={ this.handleCancelEditing }>
                    { cancelButtonText }
                </Button>
            </div>
        );
    },

    render: function() {
        if (this.state.pilot === null) {
            return this.renderLoader();
        }

        var altitudeUnitsList = Altitude.getAltitudeUnitsValueTextList();

        return (
            <View onDataModified={ this.onDataModified }>
                { this.renderError() }
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
                        selectedValue={ this.state.pilot.altitudeUnits }
                        options={ altitudeUnitsList }
                        labelText='Altitude unit:'
                        inputName='altitudeUnits'
                        errorMessage={ this.state.errors.altitudeUnits }
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
    altitudeUnits: null,
    hours: null,
    minutes: null
};


module.exports = PilotEditView;
