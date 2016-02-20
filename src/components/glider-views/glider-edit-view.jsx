'use strict';

var React = require('react');
var History = require('react-router').History;
var _ = require('lodash');
var GliderModel = require('../../models/glider');
var Validation = require('../../utils/validation');
var View = require('./../common/view');
var TopMenu = require('../common/menu/top-menu');
var BottomMenu = require('../common/menu/bottom-menu');
var BottomButtons = require('../common/buttons/bottom-buttons');
var Section = require('../common/section/section');
var SectionTitle = require('../common/section/section-title');
var SectionRow = require('../common/section/section-row');
var SectionButton = require('../common/buttons/section-button');
var TextInput = require('./../common/inputs/text-input');
var TimeInput = require('./../common/inputs/time-input');
var RemarksInput = require('./../common/inputs/remarks-input');
var Loader = require('./../common/loader');
var Button = require('../common/buttons/button');
var ErrorBox = require('./../common/notice/error-box');
var ErrorTypes = require('../../utils/error-types');


var GliderEditView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            gliderId: React.PropTypes.string
        })
    },

    mixins: [ History ],

    getInitialState: function() {
        return {
            glider: null,
            errors: _.clone(GliderEditView.formFields),
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

            GliderModel.saveGlider(this.state.glider).then(() => {
                this.handleCancelEditing();
            }).catch((error) => {
                this.handleSavingError(error);
            });

        }
    },

    handleDeleteGlider: function() {
        var alertMessage = 'We will delete this glider from all flight records';

        if (window.confirm(alertMessage)) {
            this.setState({ isDeleting: true });
            GliderModel.deleteGlider(this.props.params.gliderId).then(() => {
                this.history.pushState(null, '/gliders');
            }).catch((error) => {
                this.handleDeletingError(error);
            });
        }
    },

    handleInputChange: function(inputName, inputValue) {
        var newGlider = _.extend({}, this.state.glider, { [inputName]: inputValue });
        this.setState({ glider: newGlider }, function() {
            this.validateForm(true);
        });
    },

    handleCancelEditing: function() {
        this.history.pushState(
            null,
            this.props.params.gliderId ? ('/glider/' + this.props.params.gliderId) : '/gliders'
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

        // Fetch glider
        var glider = GliderModel.getGliderEditOutput(this.props.params.gliderId);

        // Check for errors
        if (glider !== null && glider.error) {
            this.setState({ loadingError: glider.error });
            return;
        }

        // If there is user input in the form
        // erase processing errors
        // need this for handling successful authentication
        if (this.state.glider !== null) {
            this.setState({
                savingError: null,
                deletingError: null
            });
            return;
        }

        this.setState({
            glider: glider,
            loadingError: null
        });
    },

    validateForm: function(isSoft) {
        var validationResponse = Validation.validateForm(
            GliderModel.getValidationConfig(),
            this.state.glider,
            isSoft
        );
        this.updateErrorState(validationResponse);
        return validationResponse;
    },

    updateErrorState: function(newErrors) {
        var newErrorState = _.extend({}, GliderEditView.formFields, newErrors);
        this.setState({ errors: newErrorState });
    },

    renderError: function() {
        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <TopMenu
                    leftText='Cancel'
                    onLeftClick={ this.handleCancelEditing }
                    />
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>
                <BottomMenu isGliderView={ true } />
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
                    onTryAgain={ this.handleDeleteGlider }
                    isTrying={ isTrying }
                    />
            );
        }
    },

    renderLoader: function() {
        return (
            <View onDataModified={ this.handleDataModified }>
                <TopMenu
                    leftText='Cancel'
                    onLeftClick={ this.handleCancelEditing }
                    />
                <Loader />
                <BottomMenu isGliderView={ true } />
            </View>
        );
    },

    renderDeleteSectionButton: function() {
        if (this.props.params.gliderId) {
            var isEnabled = (!this.state.isSaving && !this.state.isDeleting);
            return (
                <SectionButton
                    text={ this.state.isDeleting ? 'Deleting...' : 'Delete' }
                    buttonStyle='warning'
                    onClick={ this.handleDeleteGlider }
                    isEnabled={ isEnabled }
                    />
            );
        }
    },

    renderDeleteButton: function() {
        if (this.props.params.gliderId) {
            var isEnabled = (!this.state.isSaving && !this.state.isDeleting);
            return (
                <Button
                    text={ this.state.isDeleting ? 'Deleting...' : 'Delete' }
                    buttonStyle='warning'
                    onClick={ this.handleDeleteGlider }
                    isEnabled={ isEnabled }
                    />
            );
        }
    },

    renderSaveButton: function() {
        var isEnabled = (!this.state.isSaving && !this.state.isDeleting);
        return (
            <Button
                text={ this.state.isSaving ? 'Saving...' : 'Save' }
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
                text='Cancel'
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

        if (this.state.glider === null) {
            return this.renderLoader();
        }

        var processingError = this.state.savingError ? this.state.savingError : this.state.deletingError;
        var isEnabled = (!this.state.isSaving && !this.state.isDeleting);

        return (
            <View onDataModified={ this.handleDataModified } error={ processingError }>
                <TopMenu
                    leftText='Cancel'
                    rightText='Save'
                    onLeftClick={ this.handleCancelEditing }
                    onRightClick={ this.handleSubmit }
                    />

                <form>
                    { this.renderSavingError() }
                    { this.renderDeletingError() }
                    <Section>
                        <SectionRow>
                            <TextInput
                                inputValue={ this.state.glider.name }
                                labelText={ <span>Name<sup>*</sup>:</span> }
                                inputName='name'
                                errorMessage={ this.state.errors.name }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionTitle isSubtitle={ true }>
                            Glider usage before Koifly:
                        </SectionTitle>

                        <SectionRow>
                            <TextInput
                                inputValue={ this.state.glider.initialFlightNum }
                                labelText='Number of flights:'
                                inputName='initialFlightNum'
                                isNumber={ true }
                                errorMessage={ this.state.errors.initialFlightNum }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow>
                            <TimeInput
                                hours={ this.state.glider.hours }
                                minutes={ this.state.glider.minutes }
                                labelText='Airtime:'
                                errorMessage={ this.state.errors.initialAirtime }
                                errorMessageHours={ this.state.errors.hours }
                                errorMessageMinutes={ this.state.errors.minutes }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow isLast={ true }>
                            <RemarksInput
                                inputValue={ this.state.glider.remarks }
                                labelText='Remarks'
                                errorMessage={ this.state.errors.remarks }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <BottomButtons
                            leftElements={ [
                                this.renderSaveButton(),
                                this.renderCancelButton()
                            ] }
                            rightElement={ this.renderDeleteButton() }
                            />
                    </Section>

                    <SectionButton
                        text={ this.state.isSaving ? 'Saving...' : 'Save' }
                        type='submit'
                        buttonStyle='primary'
                        onClick={ this.handleSubmit }
                        isEnabled={ isEnabled }
                        />

                    { this.renderDeleteSectionButton() }
                </form>

                <BottomMenu isGliderView={ true } />
            </View>
        );
    }
});


GliderEditView.formFields = {
    name: null,
    initialFlightNum: null,
    initialAirtime: null,
    hours: null,
    minutes: null,
    remarks: null
};


module.exports = GliderEditView;
