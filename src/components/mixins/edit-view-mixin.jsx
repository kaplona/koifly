'use strict';

var React = require('react');
var History = require('react-router').History;
var _ = require('lodash');

var ErrorTypes = require('../../errors/error-types');
var Validation = require('../../utils/validation');

var Button = require('../common/buttons/button');
var DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
var ErrorBox = require('../common/notice/error-box');
var Loader = require('../common/loader');
var MobileButton = require('../common/buttons/mobile-button');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var View = require('../common/view');


var editViewMixin = function(modelKey) {

    const VIEW_ASSETS = require('../../constants/view-assets')[modelKey];
    var Model = VIEW_ASSETS.model;

    return {

        mixins: [ History ],

        getInitialState: function() {
            return {
                item: null,
                loadingError: null,
                savingError: null,
                deletingError: null,
                isSaving: false,
                isDeleting: false
            };
        },

        handleStoreModified: function() {
            // If waiting for server response
            // ignore any other data updates
            if (this.isProcessing()) {
                return;
            }

            // Fetch item
            var item = Model.getEditOutput(this.props.params.id);

            // Check for errors
            if (item !== null && item.error) {
                this.setState({ loadingError: item.error });
                return;
            }

            this.setState({
                item: item,
                loadingError: null
            });
        },

        handleInputChange: function(inputName, inputValue) {
            var newItem = _.extend({}, this.state.item, { [inputName]: inputValue });
            this.setState({ item: newItem }, () => {
                this.updateValidationErrors(this.validateForm(true));
            });
        },

        handleCancelEdit: function() {
            this.history.pushState(
                null,
                this.props.params.id ? `/${Model.keys.single}/${this.props.params.id}` : `/${Model.keys.plural}`
            );
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

                Model
                    .saveItem(this.state.item)
                    .then(() => {
                        this.handleCancelEdit();
                    })
                    .catch((error) => {
                        this.updateProcessingError(error, true);
                    });
            }
        },

        handleDeleteItem: function() {
            var alertMessage = VIEW_ASSETS.deleteAlertMessage;

            if (window.confirm(alertMessage)) {
                this.setState({ isDeleting: true });
                Model
                    .deleteItem(this.props.params.id)
                    .then(() => {
                        this.history.pushState(null, `/${Model.keys.plural}`);
                    })
                    .catch((error) => {
                        this.updateProcessingError(error);
                    });
            }
        },

        validateForm: function(isSoft) {
            return Validation.validateForm(
                Model.getValidationConfig(),
                this.state.item,
                isSoft
            );
        },

        updateProcessingError: function(error, isSaving) {
            if (error.type === ErrorTypes.VALIDATION_ERROR) {
                this.updateValidationErrors(error.errors);
                error = null;
            }

            this.setState({
                savingError: isSaving ? error : null,
                deletingError: !isSaving ? error : null,
                isSaving: false,
                isDeleting: false
            });
        },

        updateValidationErrors: function(errors) {
            var validationErrors = _.extend({}, this.formFields, errors);

            if (!_.isEqual(validationErrors, this.state.validationErrors)) {
                this.setState({ validationErrors: validationErrors });
            }
        },
        
        isProcessing: function() {
            return this.state.isSaving || this.state.isDeleting || false;
        },

        getProcessingError: function() {
            return this.state.savingError || this.state.deletingError || null;
        },
        
        renderNavigationMenu: function() {
            return <NavigationMenu currentView={ Model.getModelKey() } />;
        },

        renderSimpleLayout: function(children) {
            return (
                <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                    <MobileTopMenu
                        leftButtonCaption='Cancel'
                        onLeftClick={ this.handleCancelEdit }
                        />
                    { this.renderNavigationMenu() }
                    { children }
                </View>
            );
        },

        renderLoader: function() {
            return this.renderSimpleLayout(<Loader />);
        },

        renderError: function() {
            return this.renderSimpleLayout(<ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleStoreModified } />);
        },
        
        renderProcessingError: function() {
            var processingError = this.getProcessingError();
            if (processingError) {
                return (
                    <ErrorBox
                        error={ processingError }
                        onTryAgain={ this.state.savingError ? this.handleSubmit : this.handleDeleteItem }
                        isTrying={ this.isProcessing() }
                        />
                );
            }
        },
        
        renderMobileButtons: function() {
            return (
                <div>
                    <MobileButton
                        caption={ this.state.isSaving ? 'Saving...' : 'Save' }
                        type='submit'
                        buttonStyle='primary'
                        onClick={ this.handleSubmit }
                        isEnabled={ !this.isProcessing() }
                        />
                    { this.renderMobileDeleteButton() }
                </div>
            );
        },

        renderMobileDeleteButton: function() {
            if (this.props.params.id) {
                return (
                    <MobileButton
                        caption={ this.state.isDeleting ? 'Deleting...' : 'Delete' }
                        buttonStyle='warning'
                        onClick={ this.handleDeleteItem }
                        isEnabled={ !this.isProcessing() }
                        />
                );
            }
        },
        
        renderDesktopButtons: function() {
            return (
                <DesktopBottomGrid
                    leftElements={ [
                        this.renderSaveButton(),
                        this.renderCancelButton()
                    ] }
                    rightElement={ this.renderDeleteButton() }
                    />
            );
        },

        renderSaveButton: function() {
            return (
                <Button
                    caption={ this.state.isSaving ? 'Saving...' : 'Save' }
                    type='submit'
                    buttonStyle='primary'
                    onClick={ this.handleSubmit }
                    isEnabled={ !this.isProcessing() }
                    />
            );
        },

        renderCancelButton: function() {
            return (
                <Button
                    caption='Cancel'
                    buttonStyle='secondary'
                    onClick={ this.handleCancelEdit }
                    isEnabled={ !this.isProcessing() }
                    />
            );
        },
        
        renderDeleteButton: function() {
            if (this.props.params.id) {
                return (
                    <Button
                        caption={ this.state.isDeleting ? 'Deleting...' : 'Delete' }
                        buttonStyle='warning'
                        onClick={ this.handleDeleteItem }
                        isEnabled={ !this.isProcessing() }
                        />
                );
            }
        }
    };
};


module.exports = editViewMixin;
