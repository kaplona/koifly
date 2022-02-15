import React from 'react';
import { shape, string } from 'prop-types';
import Button from '../common/buttons/button';
import DesktopBottomGrid from '../common/grids/desktop-bottom-grid';
import DomUtil from '../../utils/dom-util';
import ErrorBox from '../common/notice/error-box';
import errorTypes from '../../errors/error-types';
import GliderModel from '../../models/glider';
import isEqual from 'lodash.isequal';
import MobileButton from '../common/buttons/mobile-button';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import RemarksInput from '../common/inputs/remarks-input';
import Section from '../common/section/section';
import SectionLoader from '../common/section/section-loader';
import SectionRow from '../common/section/section-row';
import SectionTitle from '../common/section/section-title';
import TextInput from '../common/inputs/text-input';
import AirtimeInput from '../common/inputs/airtime-input';
import Validation from '../../utils/validation';
import View from '../common/view';


export default class GliderEditView extends React.Component {
  constructor() {
    super();
    this.formFields = {
      name: null,
      initialFlightNum: null,
      initialAirtime: null,
      hours: null,
      minutes: null,
      remarks: null
    };

    this.state = {
      item: null, // no data received
      loadingError: null,
      processingError: null,
      isSaving: false,
      isDeleting: false,
      isInputInFocus: false,
      validationErrors: Object.assign({}, this.formFields)
    };

    this.handleStoreModified = this.handleStoreModified.bind(this);
    this.handleStoreModified = this.handleStoreModified.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.handleCancelEdit = this.handleCancelEdit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDeleteItem = this.handleDeleteItem.bind(this);
  }

  /**
   * Once store data was modified or on initial rendering,
   * requests for presentational data form the Model
   * and updates component's state
   */
  handleStoreModified() {
    // If waiting for server response
    // ignore any other data updates
    if (this.isProcessing()) {
      return;
    }

    // Fetch item
    const item = GliderModel.getEditOutput(this.props.match.params.id);

    // Check for errors
    if (item && item.error) {
      this.setState({ loadingError: item.error });
      return;
    }

    this.setState({
      item: item,
      loadingError: null
    });
  }

  /**
   * Updates state which represents input values
   * @param {string} inputName - key for this.state.item
   * @param {string} inputValue
   */
  handleInputChange(inputName, inputValue) {
    const newItem = Object.assign({}, this.state.item, { [inputName]: inputValue });
    this.setState({ item: newItem }, () => {
      this.updateValidationErrors(this.getValidationErrors(true));
    });
  }

  handleInputFocus() {
    this.setState({ isInputInFocus: true });
  }

  handleInputBlur() {
    this.setState({ isInputInFocus: false });
  }

  handleCancelEdit() {
    if (this.props.match.params.id) {
      navigationService.goToItemView(GliderModel.keys.single, this.props.match.params.id);
    } else {
      navigationService.goToListView(GliderModel.keys.plural);
    }
  }

  handleSubmit(event) {
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
    this.setState({ isSaving: true });
    GliderModel
      .saveItem(this.state.item)
      .then(() => this.handleCancelEdit())
      .catch(error => this.updateProcessingError(error));
  }

  handleDeleteItem() {
    const alertMessage = 'References to this glider will be deleted from all flight records';

    if (window.confirm(alertMessage)) {
      this.setState({ isDeleting: true });
      GliderModel
        .deleteItem(this.props.match.params.id)
        .then(() => navigationService.goToListView(GliderModel.keys.plural))
        .catch(error => this.updateProcessingError(error));
    }
  }

  getValidationErrors(isSoft) {
    return Validation.getValidationErrors(
      GliderModel.getValidationConfig(),
      this.state.item,
      isSoft
    );
  }

  /**
   * Updates state with received error
   * marks that view finished processing saving/deleting operation
   * @param {object} error
   *   @param {string} error.type
   *   @param {string} error.message
   *   @param {string} [error.errors]
   */
  updateProcessingError(error) {
    if (error.type === errorTypes.VALIDATION_ERROR) {
      this.updateValidationErrors(error.errors);
      error = null;
    }

    this.setState({
      processingError: error,
      isSaving: false,
      isDeleting: false
    });
  }

  /**
   * If validation errors changed, updates validation errors state
   * @param {object} validationErrors - object where key is a form field name, value is error message
   */
  updateValidationErrors(validationErrors) {
    validationErrors = Object.assign({}, this.formFields, validationErrors);

    if (!isEqual(validationErrors, this.state.validationErrors)) {
      this.setState({ validationErrors: validationErrors });
    }
  }

  /**
   * Whether view is processing saving or deleting operation
   * @returns {boolean} - true if processing, false - if not
   */
  isProcessing() {
    return this.state.isSaving || this.state.isDeleting;
  }

  renderNavigationMenu() {
    return (
      <NavigationMenu
        currentView={GliderModel.getModelKey()}
        isPositionFixed={!this.state.isInputInFocus}
      />
    );
  }

  renderSimpleLayout(children) {
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
  }

  renderLoader() {
    return this.renderSimpleLayout(
      <SectionLoader/>
    );
  }

  renderLoadingError() {
    return this.renderSimpleLayout(
      <ErrorBox error={this.state.loadingError} onTryAgain={this.handleStoreModified}/>
    );
  }

  renderProcessingError() {
    if (this.state.processingError) {
      return <ErrorBox error={this.state.processingError} isPadded={true}/>;
    }
  }

  renderMobileButtons() {
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
  }

  renderMobileDeleteButton() {
    if (this.props.match.params.id) {
      return (
        <MobileButton
          caption={this.state.isDeleting ? 'Deleting...' : 'Delete'}
          buttonStyle='warning'
          onClick={this.handleDeleteItem}
          isEnabled={!this.isProcessing()}
        />
      );
    }
  }

  renderDesktopButtons() {
    return (
      <DesktopBottomGrid
        leftElements={[
          this.renderSaveButton(),
          this.renderCancelButton()
        ]}
        rightElement={this.renderDeleteButton()}
      />
    );
  }

  renderSaveButton() {
    return (
      <Button
        caption={this.state.isSaving ? 'Saving...' : 'Save'}
        type='submit'
        buttonStyle='primary'
        onClick={this.handleSubmit}
        isEnabled={!this.isProcessing()}
      />
    );
  }

  renderCancelButton() {
    return (
      <Button
        caption='Cancel'
        buttonStyle='secondary'
        onClick={this.handleCancelEdit}
        isEnabled={!this.isProcessing()}
      />
    );
  }

  renderDeleteButton() {
    if (this.props.match.params.id) {
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

  renderMobileTopMenu() {
    return (
      <MobileTopMenu
        leftButtonCaption='Cancel'
        rightButtonCaption='Save'
        onLeftClick={this.handleCancelEdit}
        onRightClick={this.handleSubmit}
        isPositionFixed={!this.state.isInputInFocus}
      />
    );
  }

  render() {
    if (this.state.loadingError) {
      return this.renderLoadingError();
    }

    if (this.state.item === null) {
      return this.renderLoader();
    }

    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        {this.renderMobileTopMenu()}

        <form>
          {this.renderProcessingError()}

          <Section>
            <SectionTitle>
              Edit Glider
            </SectionTitle>

            <SectionRow>
              <TextInput
                inputValue={this.state.item.name}
                labelText='Name*:'
                inputName='name'
                errorMessage={this.state.validationErrors.name}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionTitle isSubtitle={true}>
              Glider usage before Koifly:
            </SectionTitle>

            <SectionRow>
              <TextInput
                inputValue={this.state.item.initialFlightNum}
                labelText='Number of flights:'
                inputName='initialFlightNum'
                isNumber={true}
                errorMessage={this.state.validationErrors.initialFlightNum}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionRow>
              <AirtimeInput
                hours={this.state.item.hours}
                minutes={this.state.item.minutes}
                labelText='Airtime:'
                errorMessage={
                  this.state.validationErrors.initialAirtime ||
                  this.state.validationErrors.hours ||
                  this.state.validationErrors.minutes
                }
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionRow isLast={true}>
              <RemarksInput
                inputValue={this.state.item.remarks}
                labelText='Remarks'
                errorMessage={this.state.validationErrors.remarks}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            {this.renderDesktopButtons()}

          </Section>

          {this.renderMobileButtons()}
        </form>

        {this.renderNavigationMenu()}
      </View>
    );
  }
}


GliderEditView.propTypes = {
  match: shape({
    params: shape({
      id: string // url args
    })
  }).isRequired
};
