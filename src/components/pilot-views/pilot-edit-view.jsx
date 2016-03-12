'use strict';

var React = require('react');
var History = require('react-router').History;
var _ = require('lodash');

var Altitude = require('../../utils/altitude');
var PilotModel = require('../../models/pilot');
var Validation = require('../../utils/validation');

var Button = require('../common/buttons/button');
var DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
var DropdownInput = require('../common/inputs/dropdown-input');
var ErrorBox = require('../common/notice/error-box');
var ErrorTypes = require('../../errors/error-types');
var Loader = require('../common/loader');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var TextInput = require('../common/inputs/text-input');
var TimeInput = require('../common/inputs/time-input');
var View = require('../common/view');


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
        if (error.type === ErrorTypes.VALIDATION_ERROR) {
            this.updateErrorState(error.errors);
            error = null;
        }
        
        this.setState({
            savingError: error,
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
        // If there is user input in the form
        // erase saving error
        // need this for handling successful authentication
        if (this.state.pilot !== null) {
            this.setState({ savingError: null });
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
        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <MobileTopMenu
                    leftButtonCaption='Cancel'
                    onLeftClick={ this.handleCancelEditing }
                    />
                <NavigationMenu isPilotView={ true } />
                
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified } />
            </View>
        );
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
                <MobileTopMenu
                    leftButtonCaption='Cancel'
                    onLeftClick={ this.handleCancelEditing }
                    />
                <NavigationMenu isPilotView={ true } />
                
                <Loader />
            </View>
        );
    },

    renderSaveButton: function() {
        return (
            <Button
                caption={ this.state.isSaving ? 'Saving...' : 'Save' }
                type='submit'
                buttonStyle='primary'
                onClick={ this.handleSubmit }
                isEnabled={ !this.state.isSaving }
                />
        );
    },

    renderCancelButton: function() {
        return (
            <Button
                caption='Cancel'
                buttonStyle='secondary'
                onClick={ this.handleCancelEditing }
                isEnabled={ !this.state.isSaving }
                />
        );
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.pilot === null) {
            return this.renderLoader();
        }

        var processingError = this.state.savingError ? this.state.savingError : null;
        var altitudeUnitsList = Altitude.getAltitudeUnitsValueTextList();

        return (
            <View onDataModified={ this.handleDataModified } error={ processingError }>
                <MobileTopMenu
                    leftButtonCaption='Cancel'
                    rightButtonCaption='Save'
                    onLeftClick={ this.handleCancelEditing }
                    onRightClick={ this.handleSubmit }
                    />
                <NavigationMenu isPilotView={ true } />

                <form>
                    { this.renderSavingError() }
                    
                    <Section>
                        <SectionTitle>
                            { this.state.pilot.email }
                        </SectionTitle>

                        <SectionRow>
                            <TextInput
                                inputValue={ this.state.pilot.userName }
                                labelText='Name:'
                                inputName='userName'
                                errorMessage={ this.state.errors.userName }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionTitle isSubtitle={ true }>
                            My achievements before Koifly:
                        </SectionTitle>

                        <SectionRow>
                            <TextInput
                                inputValue={ this.state.pilot.initialFlightNum }
                                labelText='Number of flights:'
                                inputName='initialFlightNum'
                                isNumber={ true }
                                errorMessage={ this.state.errors.initialFlightNum }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow>
                            <TimeInput
                                hours={ this.state.pilot.hours }
                                minutes={ this.state.pilot.minutes }
                                labelText='Airtime:'
                                errorMessage={ this.state.errors.initialAirtime }
                                errorMessageHours={ this.state.errors.hours }
                                errorMessageMinutes={ this.state.errors.minutes }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionTitle  isSubtitle={ true }>
                            My settings:
                        </SectionTitle>

                        <SectionRow isLast={ true }>
                            <DropdownInput
                                selectedValue={ this.state.pilot.altitudeUnit }
                                options={ altitudeUnitsList }
                                labelText='Altitude units:'
                                inputName='altitudeUnit'
                                errorMessage={ this.state.errors.altitudeUnit }
                                onChangeFunc={ this.handleInputChange }
                                />
                        </SectionRow>

                        <DesktopBottomGrid
                            leftElements={ [
                                this.renderSaveButton(),
                                this.renderCancelButton()
                            ] }
                            />
                    </Section>
                </form>
            </View>
        );
    }
});


PilotEditView.formFields = {
    userName: null,
    initialFlightNum: null,
    initialAirtime: null,
    altitudeUnit: null,
    hours: null,
    minutes: null
};


module.exports = PilotEditView;
