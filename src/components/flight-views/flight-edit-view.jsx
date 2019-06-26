'use strict';

import React from 'react';
import { shape, string } from 'prop-types';
import _ from 'lodash';
import Altitude from '../../utils/altitude';
import AltitudeInput from '../common/inputs/altitude-input';
import Button from '../common/buttons/button';
import DateInput from '../common/inputs/date-input';
import DesktopBottomGrid from '../common/grids/desktop-bottom-grid';
import DomUtil from '../../utils/dom-util';
import DropdownInput from '../common/inputs/dropdown-input';
import ErrorBox from '../common/notice/error-box';
import errorTypes from '../../errors/error-types';
import FlightModel from '../../models/flight';
import FightTrackUpload from './flight-track-upload';
import GliderModel from '../../models/glider';
import MobileButton from '../common/buttons/mobile-button';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import RemarksInput from '../common/inputs/remarks-input';
import Section from '../common/section/section';
import SectionLoader from '../common/section/section-loader';
import SectionRow from '../common/section/section-row';
import SectionTitle from '../common/section/section-title';
import SiteModel from '../../models/site';
import TimeInput from '../common/inputs/time-input';
import Util from '../../utils/util';
import Validation from '../../utils/validation';
import View from '../common/view';


export default class FlightEditView extends React.Component {
  constructor() {
    super();
    this.formFields = {
      date: null,
      siteId: null,
      altitude: null,
      airtime: null,
      gliderId: null,
      remarks: null,
      hours: null,
      minutes: null
    };

    this.state = {
      isDeleting: false,
      isInputInFocus: false,
      isSaving: false,
      isSledRide: false,
      item: null, // no data received
      loadingError: null,
      processingError: null,
      validationErrors: Object.assign({}, this.formFields)
    };

    this.handleStoreModified = this.handleStoreModified.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.handleCancelEdit = this.handleCancelEdit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDeleteItem = this.handleDeleteItem.bind(this);
    this.handleSledRide = this.handleSledRide.bind(this);
    this.handleFlightTrackData = this.handleFlightTrackData.bind(this);
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
    const item = FlightModel.getEditOutput(this.props.match.params.id);

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
      navigationService.goToItemView(FlightModel.keys.single, this.props.match.params.id);
    } else {
      navigationService.goToListView(FlightModel.keys.plural);
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
    FlightModel
      .saveItem(this.state.item)
      .then(() => this.handleCancelEdit())
      .catch(error => this.updateProcessingError(error));
  }

  handleDeleteItem() {
    const alertMessage = 'Delete this flight?';

    if (window.confirm(alertMessage)) {
      this.setState({ isDeleting: true });
      FlightModel
        .deleteItem(this.props.match.params.id)
        .then(() => navigationService.goToListView(FlightModel.keys.plural))
        .catch(error => this.updateProcessingError(error));
    }
  }

  handleSledRide(isSledRide) {
    if (!isSledRide) {
      this.setState({ isSledRide: false });
      return;
    }

    let altitude = this.state.item.altitude;
    let altitudeUnit = this.state.item.altitudeUnit;
    if (this.state.item.siteId) {
      altitude = SiteModel.getLaunchAltitude(this.state.item.siteId).toString();
      altitudeUnit = Altitude.getUserAltitudeUnit();
    }

    const item = Object.assign({}, this.state.item, { altitude: altitude, altitudeUnit: altitudeUnit });

    this.setState({
      item: item,
      isSledRide: true
    });
  }

  handleFlightTrackData(flightTrackData, igc) {
    if (!flightTrackData || !igc) {
      const newItem = Object.assign({}, this.state.item, { igc: null });
      this.setState({ item: newItem });
      return;
    }

    const { altitude, date, hours, minutes, siteId } = this.state.item;
    const flightTrackHoursMinutes = Util.getHoursMinutes(flightTrackData.airtime);

    const newItem = Object.assign({}, this.state.item, {
      date: flightTrackData.date || date,
      siteId: flightTrackData.siteId || siteId,
      altitude: flightTrackData.maxAltitude || altitude,
      hours: flightTrackData.airtime ? flightTrackHoursMinutes.hours : hours,
      minutes: flightTrackData.airtime ? flightTrackHoursMinutes.minutes : minutes,
      igc
    });

    this.setState({ item: newItem }, () => {
      this.updateValidationErrors(this.getValidationErrors(true));
    });
  }

  getValidationErrors(isSoft) {
    return Validation.getValidationErrors(
      FlightModel.getValidationConfig(),
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

    if (!_.isEqual(validationErrors, this.state.validationErrors)) {
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
        currentView={FlightModel.getModelKey()}
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
      return <ErrorBox error={this.state.processingError}/>;
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

    const sites = SiteModel.getSiteValueTextList();
    const gliders = GliderModel.getGliderValueTextList();

    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        {this.renderMobileTopMenu()}

        <form>
          {this.renderProcessingError()}

          <Section>
            <SectionTitle>
              Edit Flight
            </SectionTitle>

            <SectionRow>
              <DateInput
                inputValue={this.state.item.date}
                labelText='Date*:'
                inputName='date'
                errorMessage={this.state.validationErrors.date}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionRow>
              <DropdownInput
                selectedValue={this.state.item.siteId || '0'}
                options={sites}
                labelText='Site:'
                inputName='siteId'
                emptyValue={'0'}
                errorMessage={this.state.validationErrors.siteId}
                onChangeFunc={(inputName, inputValue) => {
                  this.handleInputChange(inputName, inputValue === '0' ? null : inputValue);
                }}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionRow>
              <AltitudeInput
                inputValue={this.state.item.altitude}
                selectedAltitudeUnit={this.state.item.altitudeUnit}
                labelText='Max altitude:'
                errorMessage={this.state.validationErrors.altitude}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
                onSledRide={this.handleSledRide}
                isSledRide={this.state.isSledRide}
              />
            </SectionRow>

            <SectionRow>
              <TimeInput
                hours={this.state.item.hours}
                minutes={this.state.item.minutes}
                labelText='Airtime:'
                errorMessage={
                  this.state.validationErrors.airtime ||
                  this.state.validationErrors.hours ||
                  this.state.validationErrors.minutes
                }
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionRow>
              <DropdownInput
                selectedValue={this.state.item.gliderId || '0'}
                options={gliders}
                labelText='Glider:'
                inputName='gliderId'
                emptyValue={'0'}
                errorMessage={this.state.validationErrors.gliderId}
                onChangeFunc={(inputName, inputValue) => {
                  this.handleInputChange(inputName, inputValue === '0' ? null : inputValue);
                }}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionRow isMobileLast={true}>
              <RemarksInput
                inputValue={this.state.item.remarks}
                labelText='Remarks:'
                errorMessage={this.state.validationErrors.remarks}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionTitle isSubtitle={true} isDesktopOnly={true}>
              Upload IGC:
            </SectionTitle>

            <SectionRow isDesktopOnly={true}>
              <FightTrackUpload igc={this.state.item.igc} onLoad={this.handleFlightTrackData}/>
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


FlightEditView.propTypes = {
  match: shape({
    params: shape({
      id: string // url args
    })
  }).isRequired
};
