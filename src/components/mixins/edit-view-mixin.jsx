'use strict';

const React = require('react');
const _ = require('lodash');
const browserHistory = require('react-router').browserHistory;
const Button = require('../common/buttons/button');
const DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
const DomUtil = require('../../utils/dom-util');
const ErrorBox = require('../common/notice/error-box');
const ErrorTypes = require('../../errors/error-types');
const MobileButton = require('../common/buttons/mobile-button');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const NavigationMenu = require('../common/menu/navigation-menu');
const SectionLoader = require('../common/section/section-loader');
const Validation = require('../../utils/validation');
const View = require('../common/view');


const editViewMixin = function (modelKey) {

  const VIEW_ASSETS = require('../../constants/view-assets')[modelKey];
  const Model = VIEW_ASSETS.model;

  return {

    getInitialState: function () {
      return {
        item: null, // no data received
        loadingError: null,
        processingError: null,
        isSaving: false,
        isDeleting: false,
        isInputInFocus: false
      };
    },

    /**
     * Once store data was modified or on initial rendering,
     * requests for presentational data form the Model
     * and updates component's state
     */
    handleStoreModified: function () {
      // If waiting for server response
      // ignore any other data updates
      if (this.isProcessing()) {
        return;
      }

      // Fetch item
      const item = Model.getEditOutput(this.props.params.id);

      // Check for errors
      if (item && item.error) {
        this.setState({loadingError: item.error});
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
    handleInputChange: function (inputName, inputValue) {
      const newItem = _.extend({}, this.state.item, {[inputName]: inputValue});
      this.setState({item: newItem}, () => {
        this.updateValidationErrors(this.getValidationErrors(true));
      });
    },

    handleInputFocus: function () {
      this.setState({isInputInFocus: true});
    },

    handleInputBlur: function () {
      this.setState({isInputInFocus: false});
    },

    handleCancelEdit: function () {
      let path;
      if (this.props.params.id) {
        path = `/${encodeURIComponent(Model.keys.single)}/${encodeURIComponent(this.props.params.id)}`;
      } else {
        path = `/${encodeURIComponent(Model.keys.plural)}`;
      }

      browserHistory.push(path);
    },

    handleSubmit: function (event) {
      if (event) {
        event.preventDefault();
      }

      const validationErrors = this.getValidationErrors();
      if (validationErrors) {
        DomUtil.scrollToTheTop();
        this.updateValidationErrors(validationErrors);
        return;
      }

      // If no errors
      this.setState({isSaving: true});
      Model
        .saveItem(this.state.item)
        .then(() => this.handleCancelEdit())
        .catch(error => this.updateProcessingError(error));
    },

    handleDeleteItem: function () {
      const alertMessage = VIEW_ASSETS.deleteAlertMessage;

      if (window.confirm(alertMessage)) {
        this.setState({isDeleting: true});
        Model
          .deleteItem(this.props.params.id)
          .then(() => browserHistory.push(`/${encodeURIComponent(Model.keys.plural)}`))
          .catch(error => this.updateProcessingError(error));
      }
    },

    getValidationErrors: function (isSoft) {
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
    updateProcessingError: function (error) {
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
    updateValidationErrors: function (validationErrors) {
      validationErrors = _.extend({}, this.formFields, validationErrors);

      if (!_.isEqual(validationErrors, this.state.validationErrors)) {
        this.setState({validationErrors: validationErrors});
      }
    },

    /**
     * Whether view is processing saving or deleting operation
     * @returns {boolean} - true if processing, false - if not
     */
    isProcessing: function () {
      // the last false is for pilot-edit-view since it doesn't have state.isDeleting, user can't delete pilot
      return this.state.isSaving || this.state.isDeleting || false;
    },

    renderNavigationMenu: function () {
      return (
        <NavigationMenu
          currentView={Model.getModelKey()}
          isPositionFixed={!this.state.isInputInFocus}
        />
      );
    },

    renderSimpleLayout: function (children) {
      return (
        <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
          <MobileTopMenu
            leftButtonCaption='Cancel'
            onLeftClick={this.handleCancelEdit}
          />
          {this.renderNavigationMenu()}
          {children}
        </View>
      );
    },

    renderLoader: function () {
      return this.renderSimpleLayout(
        <SectionLoader/>
      );
    },

    renderLoadingError: function () {
      return this.renderSimpleLayout(
        <ErrorBox error={this.state.loadingError} onTryAgain={this.handleStoreModified}/>
      );
    },

    renderProcessingError: function () {
      if (this.state.processingError) {
        return <ErrorBox error={this.state.processingError}/>;
      }
    },

    renderMobileButtons: function () {
      return (
        <div>
          <MobileButton
            caption={this.state.isSaving ? 'Saving...' : 'Save'}
            type='submit'
            buttonStyle='primary'
            onClick={this.handleSubmit}
            isEnabled={!this.isProcessing()}
          />
          {this.renderMobileDeleteButton()}
        </div>
      );
    },

    renderMobileDeleteButton: function () {
      if (this.props.params.id) {
        return (
          <MobileButton
            caption={this.state.isDeleting ? 'Deleting...' : 'Delete'}
            buttonStyle='warning'
            onClick={this.handleDeleteItem}
            isEnabled={!this.isProcessing()}
          />
        );
      }
    },

    renderDesktopButtons: function () {
      return (
        <DesktopBottomGrid
          leftElements={[
            this.renderSaveButton(),
            this.renderCancelButton()
          ]}
          rightElement={this.renderDeleteButton()}
        />
      );
    },

    renderSaveButton: function () {
      return (
        <Button
          caption={this.state.isSaving ? 'Saving...' : 'Save'}
          type='submit'
          buttonStyle='primary'
          onClick={this.handleSubmit}
          isEnabled={!this.isProcessing()}
        />
      );
    },

    renderCancelButton: function () {
      return (
        <Button
          caption='Cancel'
          buttonStyle='secondary'
          onClick={this.handleCancelEdit}
          isEnabled={!this.isProcessing()}
        />
      );
    },

    renderDeleteButton: function () {
      if (this.props.params.id) {
        return (
          <Button
            caption={this.state.isDeleting ? 'Deleting...' : 'Delete'}
            buttonStyle='warning'
            onClick={this.handleDeleteItem}
            isEnabled={!this.isProcessing()}
          />
        );
      }
    }
  };
};


module.exports = editViewMixin;
