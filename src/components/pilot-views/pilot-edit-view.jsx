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
            validationErrors: _.clone(PilotEditView.formFields),
            loadingError: null,
            savingError: null,
            isSaving: false
        };
    },

    handleStoreModified: function() {
        // If waiting for server response
        // ignore any other data updates
        if (this.state.isSaving) {
            return;
        }

        // Fetch pilot info
        var pilot = PilotModel.getEditOutput();

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

    handleInputChange: function(inputName, inputValue) {
        var newPilotInfo = _.extend({}, this.state.pilot, { [inputName]: inputValue });
        this.setState({ pilot: newPilotInfo }, function() {
            this.updateValidationErrors(this.validateForm(true));
        });
    },

    handleCancelEdit: function() {
        this.history.pushState(null, '/pilot');
    },

    handleSubmit: function(event) {
        if (event) {
            event.preventDefault();
        }

        var validationResponse = this.validateForm();
        this.updateValidationErrors(validationResponse);
        // If no errors
        if (validationResponse === true) {
            this.setState({ isSaving: true });

            PilotModel.savePilotInfo(this.state.pilot).then(() => {
                this.handleCancelEdit();
            }).catch((error) => {
                this.handleSavingError(error);
            });
        }
    },

    handleSavingError: function(error) {
        if (error.type === ErrorTypes.VALIDATION_ERROR) {
            this.updateValidationErrors(error.errors);
            error = null;
        }
        
        this.setState({
            savingError: error,
            isSaving: false
        });
    },

    validateForm: function(isSoft) {
        return Validation.validateForm(
            PilotModel.getValidationConfig(),
            this.state.pilot,
            isSoft
        );
    },

    updateValidationErrors: function(newErrors) {
        var newErrorState = _.extend({}, PilotEditView.formFields, newErrors);
        this.setState({ errors: newErrorState });
    },

    renderLayout: function(children) {
        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                <MobileTopMenu
                    leftButtonCaption='Cancel'
                    onLeftClick={ this.handleCancelEdit }
                    />
                <NavigationMenu currentView={ PilotModel.getModelKey() } />
                { children }
            </View>
        );
    },

    renderLoader: function() {
        return this.renderLayout(<Loader />);
    },

    renderError: function() {
        return this.renderLayout(<ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleStoreModified } />);
    },

    renderSavingError: function() {
        if (this.state.savingError) {
            return (
                <ErrorBox
                    error={ this.state.savingError }
                    onTryAgain={ this.handleSubmit }
                    isTrying={ this.state.isSaving }
                    />
            );
        }
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
                onClick={ this.handleCancelEdit }
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

        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.savingError }>
                <MobileTopMenu
                    leftButtonCaption='Cancel'
                    rightButtonCaption='Save'
                    onLeftClick={ this.handleCancelEdit }
                    onRightClick={ this.handleSubmit }
                    />
                <NavigationMenu currentView={ PilotModel.getModelKey() } />

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
                                errorMessage={ this.state.validationErrors.userName }
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
                                errorMessage={ this.state.validationErrors.initialFlightNum }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow>
                            <TimeInput
                                hours={ this.state.pilot.hours }
                                minutes={ this.state.pilot.minutes }
                                labelText='Airtime:'
                                errorMessage={
                                    this.state.validationErrors.initialAirtime ||
                                    this.state.validationErrors.hours ||
                                    this.state.validationErrors.minutes
                                }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionTitle  isSubtitle={ true }>
                            My settings:
                        </SectionTitle>

                        <SectionRow isLast={ true }>
                            <DropdownInput
                                selectedValue={ this.state.pilot.altitudeUnit }
                                options={ Altitude.getAltitudeUnitsValueTextList() }
                                labelText='Altitude units:'
                                inputName='altitudeUnit'
                                errorMessage={ this.state.validationErrors.altitudeUnit }
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
