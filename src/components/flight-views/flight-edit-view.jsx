'use strict';

var React = require('react');
var History = require('react-router').History;
var _ = require('lodash');

var FlightModel = require('../../models/flight');
var GliderModel = require('../../models/glider');
var SiteModel = require('../../models/site');
var Validation = require('../../utils/validation');

var AltitudeInput = require('../common/inputs/altitude-input');
var Button = require('../common/buttons/button');
var DateInput = require('../common/inputs/date-input');
var DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
var DropdownInput = require('../common/inputs/dropdown-input');
var ErrorBox = require('../common/notice/error-box');
var ErrorTypes = require('../../errors/error-types');
var Loader = require('../common/loader');
var MobileButton = require('../common/buttons/mobile-button');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var RemarksInput = require('../common/inputs/remarks-input');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var TimeInput = require('../common/inputs/time-input');
var View = require('../common/view');


var FlightEditView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({ // url args
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
                this.handleCancelEditing();
            }).catch((error) => {
                this.handleSavingError(error);
            });
        }
    },

    handleDeleteFlight: function() {
        var alertMessage = 'Delete this flight?';

        if (window.confirm(alertMessage)) {
            this.setState({ isDeleting: true });
            FlightModel.deleteFlight(this.props.params.flightId).then(() => {
                this.history.pushState(null, '/flights');
            }).catch((error) => {
                this.handleDeletingError(error);
            });
        }
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
        if (error.type === ErrorTypes.VALIDATION_ERROR) {
            this.updateErrorState(error.errors);
            error = null;
        }

        this.setState({
            savingError: error,
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

        // If there is user input in the form
        // erase errors
        if (this.state.flight !== null) {
            this.setState({
                loadingError: null,
                savingError: null,
                deletingError: null
            });
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
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <MobileTopMenu
                    leftButtonCaption='Cancel'
                    onLeftClick={ this.handleCancelEditing }
                    />
                <NavigationMenu isFlightView={ true } />
                
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
        return (
            <View onDataModified={ this.handleDataModified }>
                <MobileTopMenu
                    leftButtonCaption='Cancel'
                    onLeftClick={ this.handleCancelEditing }
                    />
                <NavigationMenu isFlightView={ true } />
                
                <Loader />
            </View>
        );
    },

    renderMobileDeleteButton: function() {
        if (this.props.params.flightId) {
            var isEnabled = (!this.state.isSaving && !this.state.isDeleting);
            return (
                <MobileButton
                    caption={ this.state.isDeleting ? 'Deleting...' : 'Delete' }
                    buttonStyle='warning'
                    onClick={ this.handleDeleteFlight }
                    isEnabled={ isEnabled }
                    />
            );
        }
    },

    renderDeleteButton: function() {
        if (this.props.params.flightId) {
            var isEnabled = (!this.state.isSaving && !this.state.isDeleting);
            return (
                <Button
                    caption={ this.state.isDeleting ? 'Deleting...' : 'Delete' }
                    buttonStyle='warning'
                    onClick={ this.handleDeleteFlight }
                    isEnabled={ isEnabled }
                    />
            );
        }
    },

    renderSaveButton: function() {
        var isEnabled = (!this.state.isSaving && !this.state.isDeleting);
        return (
            <Button
                caption={ this.state.isSaving ? 'Saving...' : 'Save' }
                type='submit'
                buttonStyle='primary'
                onClick={ this.handleSubmit }
                isEnabled={ isEnabled }
                />
        );
    },

    renderCancelButton: function() {
        var isEnabled = (!this.state.isSaving && !this.state.isDeleting);
        return (
            <Button
                caption='Cancel'
                buttonStyle='secondary'
                onClick={ this.handleCancelEditing }
                isEnabled={ isEnabled }
                />
        );
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.flight === null) {
            return this.renderLoader();
        }

        var processingError = this.state.savingError ? this.state.savingError : this.state.deletingError;
        var isEnabled = (!this.state.isSaving && !this.state.isDeleting);
        var sites = SiteModel.getSiteValueTextList();
        var gliders = GliderModel.getGliderValueTextList();

        return (
            <View onDataModified={ this.handleDataModified } error={ processingError }>
                <MobileTopMenu
                    leftButtonCaption='Cancel'
                    rightButtonCaption='Save'
                    onLeftClick={ this.handleCancelEditing }
                    onRightClick={ this.handleSubmit }
                    />
                <NavigationMenu isFlightView={ true } />

                <form>
                    { this.renderSavingError() }
                    { this.renderDeletingError() }
                    <Section>
                        <SectionRow>
                            <DateInput
                                inputValue={ this.state.flight.date }
                                labelText={ <span>Date<sup>*</sup>:</span> }
                                inputName='date'
                                errorMessage={ this.state.errors.date }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow>
                            <DropdownInput
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
                        </SectionRow>

                        <SectionRow>
                            <AltitudeInput
                                inputValue={ this.state.flight.altitude }
                                selectedAltitudeUnit={ this.state.flight.altitudeUnit }
                                labelText='Max altitude:'
                                errorMessage={ this.state.errors.altitude }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow>
                            <TimeInput
                                hours={ this.state.flight.hours }
                                minutes={ this.state.flight.minutes }
                                labelText='Airtime:'
                                errorMessage={ this.state.errors.airtime }
                                errorMessageHours={ this.state.errors.hours }
                                errorMessageMinutes={ this.state.errors.minutes }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow>
                            <DropdownInput
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
                        </SectionRow>

                        <SectionRow isLast={ true }>
                            <RemarksInput
                                inputValue={ this.state.flight.remarks }
                                labelText='Remarks:'
                                errorMessage={ this.state.errors.remarks }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <DesktopBottomGrid
                            leftElements={ [
                                this.renderSaveButton(),
                                this.renderCancelButton()
                            ] }
                            rightElement={ this.renderDeleteButton() }
                            />
                    </Section>

                    <MobileButton
                        caption={ this.state.isSaving ? 'Saving...' : 'Save' }
                        type='submit'
                        buttonStyle='primary'
                        onClick={ this.handleSubmit }
                        isEnabled={ isEnabled }
                        />

                    { this.renderMobileDeleteButton() }
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
