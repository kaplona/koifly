import React from 'react';
import { shape, string } from 'prop-types';
import Altitude from '../../utils/altitude';
import AppLink from '../common/app-link';
import Button from '../common/buttons/button';
import DesktopBottomGrid from '../common/grids/desktop-bottom-grid';
import DomUtil from '../../utils/dom-util';
import DropdownInput from '../common/inputs/dropdown-input';
import ErrorBox from '../common/notice/error-box';
import errorTypes from '../../errors/error-types';
import isEqual from 'lodash.isequal';
import MobileButton from '../common/buttons/mobile-button';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import PilotModel from '../../models/pilot';
import Section from '../common/section/section';
import SectionLoader from '../common/section/section-loader';
import SectionRow from '../common/section/section-row';
import SectionTitle from '../common/section/section-title';
import TextInput from '../common/inputs/text-input';
import TimeInput from '../common/inputs/time-input';
import Validation from '../../utils/validation';
import View from '../common/view';


export default class PilotEditView extends React.Component {
  constructor() {
    super();
    this.formFields = {
      userName: null,
      initialFlightNum: null,
      initialAirtime: null,
      altitudeUnit: null,
      hours: null,
      minutes: null
    };

    this.state = {
      item: null, // no data received
      loadingError: null,
      processingError: null,
      isSaving: false,
      isInputInFocus: false,
      validationErrors: Object.assign({}, this.formFields)
    };

    this.handleStoreModified = this.handleStoreModified.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancelEdit = this.handleCancelEdit.bind(this);
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
    const item = PilotModel.getEditOutput(this.props.match.params.id);

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
      navigationService.goToItemView(PilotModel.keys.single, this.props.match.params.id);
    } else {
      navigationService.goToListView(PilotModel.keys.plural);
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
    PilotModel
      .saveItem(this.state.item)
      .then(() => this.handleCancelEdit())
      .catch(error => this.updateProcessingError(error));
  }

  getValidationErrors(isSoft) {
    return Validation.getValidationErrors(
      PilotModel.getValidationConfig(),
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
      isSaving: false
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
    return this.state.isSaving;
  }

  renderNavigationMenu() {
    return (
      <NavigationMenu
        currentView={PilotModel.getModelKey()}
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
      </div>
    );
  }

  renderDesktopButtons() {
    return (
      <DesktopBottomGrid
        leftElements={[
          this.renderSaveButton(),
          this.renderCancelButton()
        ]}
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
              {this.state.item.email}
            </SectionTitle>

            <SectionRow>
              <TextInput
                inputValue={this.state.item.userName || ''}
                labelText='Name:'
                inputName='userName'
                errorMessage={this.state.validationErrors.userName}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionTitle isSubtitle={true}>
              My achievements before Koifly:
            </SectionTitle>

            <SectionRow>
              <TextInput
                inputValue={this.state.item.initialFlightNum || ''}
                labelText='Number of flights:'
                inputName='initialFlightNum'
                isNumber={true}
                errorMessage={this.state.validationErrors.initialFlightNum}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionRow isLast={true}>
              <TimeInput
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

            <SectionRow isDesktopOnly={true}>
              <AppLink onClick={navigationService.goToFlightsUpload}>Or upload your flights</AppLink>
            </SectionRow>

            <SectionTitle isSubtitle={true}>
              My settings:
            </SectionTitle>

            <SectionRow isLast={true}>
              <DropdownInput
                selectedValue={this.state.item.altitudeUnit}
                options={Altitude.getAltitudeUnitsValueTextList()}
                labelText='Altitude units:'
                inputName='altitudeUnit'
                errorMessage={this.state.validationErrors.altitudeUnit}
                onChangeFunc={this.handleInputChange}
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


PilotEditView.propTypes = {
  match: shape({
    params: shape({
      id: string // url args
    })
  }).isRequired
};
