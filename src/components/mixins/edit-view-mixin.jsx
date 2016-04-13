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
                item: null, // no data received
                loadingError: null,
                processingError: null,
                isSaving: false,
                isDeleting: false
            };
        },

        /**
         * Once store data was modified or on initial rendering,
         * requests for presentational data form the Model
         * and updates component's state
         */
        handleStoreModified: function() {
            // If waiting for server response
            // ignore any other data updates
            if (this.isProcessing()) {
                return;
            }

            // Fetch item
            var item = Model.getEditOutput(this.props.params.id);

            // Check for errors
            if (item && item.error) {
                this.setState({ loadingError: item.error });
                return;
            }

            this.setState({
                item: item,
                loadingError: null
            });
        },

        /**
         * Updates state which represents input values
         * @param {string} inputName - key for this.state.item
         * @param {string} inputValue
         */
        handleInputChange: function(inputName, inputValue) {
            var newItem = _.extend({}, this.state.item, { [inputName]: inputValue });
            this.setState({ item: newItem }, () => {
                this.updateValidationErrors(this.getValidationErrors(true));
            });
        },

        handleCancelEdit: function() {
            var path;
            if (this.props.params.id) {
                path = `/${encodeURIComponent(Model.keys.single)}/${encodeURIComponent(this.props.params.id)}`;
            } else {
                path = `/${encodeURIComponent(Model.keys.plural)}`;
            }
            
            this.history.pushState(null, path);
        },

        handleSubmit: function(event) {
            if (event) {
                event.preventDefault();
            }

            var validationErrors = this.getValidationErrors();
            if (validationErrors) {
                this.updateValidationErrors(validationErrors);
                return;
            }
            
            // If no errors
            this.setState({ isSaving: true });
            Model
                .saveItem(this.state.item)
                .then(() => this.handleCancelEdit())
                .catch(error => this.updateProcessingError(error));
        },

        handleDeleteItem: function() {
            var alertMessage = VIEW_ASSETS.deleteAlertMessage;

            if (window.confirm(alertMessage)) {
                this.setState({ isDeleting: true });
                Model
                    .deleteItem(this.props.params.id)
                    .then(() => this.history.pushState(null, `/${encodeURIComponent(Model.keys.plural)}`))
                    .catch(error => this.updateProcessingError(error));
            }
        },

        getValidationErrors: function(isSoft) {
            return Validation.getValidationErrors(
                Model.getValidationConfig(),
                this.state.item,
                isSoft
            );
        },

        /**
         * Updates state with received error
         * marks that view finished processing saving/deleting operation
         * @param {object} error
         *   @param {string} error.type
         *   @param {string} error.message
         *   @param {string} [error.errors]
         */
        updateProcessingError: function(error) {
            if (error.type === ErrorTypes.VALIDATION_ERROR) {
                this.updateValidationErrors(error.errors);
                error = null;
            }

            this.setState({
                processingError: error,
                isSaving: false,
                isDeleting: false
            });
        },

        /**
         * If validation errors changed, updates validation errors state
         * @param {object} validationErrors - object where key is a form field name, value is error message
         */
        updateValidationErrors: function(validationErrors) {
            if (!validationErrors) {
                return;
            }

            validationErrors = _.extend({}, this.formFields, validationErrors);

            if (!_.isEqual(validationErrors, this.state.validationErrors)) {
                this.setState({ validationErrors: validationErrors });
            }
        },

        /**
         * Whether view is processing saving or deleting operation
         * @returns {boolean} - true if processing, false - if not
         */
        isProcessing: function() {
            // the last false is for pilot-edit-view since it doesn't have state.isDeleting, user can't delete pilot
            return this.state.isSaving || this.state.isDeleting || false;
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

        renderLoadingError: function() {
            return this.renderSimpleLayout(
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleStoreModified } />
            );
        },
        
        renderProcessingError: function() {
            if (this.state.processingError) {
                return <ErrorBox error={ this.state.processingError } />;
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
