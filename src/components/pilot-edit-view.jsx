'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var $ = require('jquery');
var _ = require('underscore');
var PubSub = require('../utils/pubsub');
var PilotModel = require('../models/pilot');
var Validation = require('../utils/validation');
var Button = require('./common/button');
var TextInput = require('./common/text-input');
var TimeInput = require('./common/time-input');
var DropDown = require('./common/dropdown');
var Loader = require('./common/loader');


var PilotEditView = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            pilot: null,
            errors: {
                initialFlightNum: '',
                initialAirtime: '',
                altitudeUnits: '',
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
            var newPilotInfo =  _.clone(this.state.pilot);
            newPilotInfo.initialAirtime = parseInt(newPilotInfo.hours) * 60 + parseInt(newPilotInfo.minutes);
            PilotModel.savePilotInfo(newPilotInfo);
            this.history.pushState(null, '/pilot');
        }
    },

    handleInputChange: function(inputName, inputValue) {
        var newPilotInfo =  _.clone(this.state.pilot);
        newPilotInfo[inputName] = inputValue;
        this.setState({ pilot: newPilotInfo }, function() {
            this.validateForm(true);
        });
    },

    onDataModified: function() {
        var pilot = PilotModel.getPilotEditOutput();
        if (pilot !== null) {
            pilot.hours = Math.floor(pilot.initialAirtime / 60);
            pilot.minutes = pilot.initialAirtime % 60;
        }
        this.setState({ pilot: pilot });
    },


    validateForm: function(softValidation) {
        var newPilotInfo =  _.clone(this.state.pilot);
        var validationRespond = Validation.validateForm(
                PilotModel.getValidationConfig(),
                newPilotInfo,
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
        return (
            <div>
                <Loader />
                <div className='button__menu'>
                    <Button active={ false }>Save</Button>
                    <Link to='/pilot'><Button>Cancel</Button></Link>
                </div>
            </div>
        );
    },

    render: function() {
        if (this.state.pilot === null) {
            return (<div>{ this.renderLoader() }</div>);
        }

        var rawAltitudeUnitsList = PilotModel.getAltitudeUnitsList();
        var altitudeUnitsList = rawAltitudeUnitsList.map((unitName) => {
            return {
                value: unitName,
                text: unitName
            };
        });

        return (
            <form onSubmit={ this.handleSubmit }>
                <div className='container__title'>{ this.state.pilot.userName }</div>

                <div>My achievements before Koifly:</div>

                <TextInput
                    inputValue={ this.state.pilot.initialFlightNum }
                    labelText='Number of Flights:'
                    errorMessage={ this.state.errors.initialFlightNum }
                    onChange={ this.handleInputChange.bind(this, 'initialFlightNum') }
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
                    labelText='Altitude units:'
                    errorMessage={ this.state.errors.altitudeUnits }
                    onChangeFunc={ this.handleInputChange.bind(this, 'altitudeUnits') }
                    />

                <div className='button__menu'>
                    <Button type='submit'>Save</Button>
                    <Link to='/pilot'><Button>Cancel</Button></Link>
                </div>
            </form>
        );
    }
});


module.exports = PilotEditView;



