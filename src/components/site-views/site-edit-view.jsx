import React from 'react';
import { shape, string } from 'prop-types';
import Altitude from '../../utils/altitude';
import AltitudeInput from '../common/inputs/altitude-input';
import Button from '../common/buttons/button';
import CoordinatesInput from '../common/inputs/coordinates-input';
import dataService from '../../services/data-service';
import Distance from '../../utils/distance';
import DesktopBottomGrid from '../common/grids/desktop-bottom-grid';
import DomUtil from '../../utils/dom-util';
import ErrorBox from '../common/notice/error-box';
import errorTypes from '../../errors/error-types';
import InteractiveMap from '../common/maps/interactive-map';
import isEqual from 'lodash.isequal';
import mapConstants from '../../constants/map-constants';
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
import SiteProposalNotice from '../common/notice/site-proposal-notice';
import TextInput from '../common/inputs/text-input';
import Util from '../../utils/util';
import Validation from '../../utils/validation';
import View from '../common/view';


export default class SiteEditView extends React.Component {
  constructor() {
    super();
    this.formFields = {
      name: null,
      launchAltitude: null,
      location: null,
      coordinates: null,
      remarks: null
    };

    this.state = {
      item: null, // no data received
      proposals: null,
      proposalError: null,
      proposalMaxDist: 2,
      loadingError: null,
      processingError: null,
      isSaving: false,
      isDeleting: false,
      isInputInFocus: false,
      isSiteProposalsShown: [],
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
    this.handleMapShow = this.handleMapShow.bind(this);
    this.handleMapHide = this.handleMapHide.bind(this);
    this.handleIncreaseProposalMaxDist = this.handleIncreaseProposalMaxDist.bind(this);
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
    const item = SiteModel.getEditOutput(this.props.match.params.id);

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

    if (inputName === 'coordinates' && Util.isEmptyString(this.state.item.name)) {
      this.fetchSiteProposal();
    }
  }

  handleInputFocus() {
    this.setState({ isInputInFocus: true });
  }

  handleInputBlur() {
    this.setState({ isInputInFocus: false });
  }

  handleCancelEdit() {
    if (this.props.match.params.id) {
      navigationService.goToItemView(SiteModel.keys.single, this.props.match.params.id);
    } else {
      navigationService.goToListView(SiteModel.keys.plural);
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
    SiteModel
      .saveItem(this.state.item)
      .then(() => this.handleCancelEdit())
      .catch(error => this.updateProcessingError(error));
  }

  handleDeleteItem() {
    const alertMessage = 'References to this site will be deleted from all flight records';

    if (window.confirm(alertMessage)) {
      this.setState({ isDeleting: true });
      SiteModel
        .deleteItem(this.props.match.params.id)
        .then(() => navigationService.goToListView(SiteModel.keys.plural))
        .catch(error => this.updateProcessingError(error));
    }
  }

  handleMapShow() {
    this.setState({ isMapShown: true });
    this.handleSiteProposalHide('all');
  }

  handleMapHide() {
    this.setState({ isMapShown: false });
  }

  handleIncreaseProposalMaxDist() {
    this.setState({ proposalMaxDist: this.state.proposalMaxDist * 2 });
    this.fetchSiteProposal();
  }

  // set site proposal with index or 'all' invisible
  handleSiteProposalHide(index) {
    const isSiteProposalsShownTemp = this.state.isSiteProposalsShown;
    if (index === 'all') {
      this.setState({ isSiteProposalsShown: isSiteProposalsShownTemp.fill(false) });
    } else {
      isSiteProposalsShownTemp[index] = false;
      this.setState({ isSiteProposalsShown: isSiteProposalsShownTemp });
    }
  }

  handleUseSiteProposal(index) {
    const name = this.state.proposals[index].properties.name;
    const lat = this.state.proposals[index].geometry.coordinates[1];
    const lng = this.state.proposals[index].geometry.coordinates[0];
    const alt = Altitude.getAltitudeInGivenUnits(this.state.proposals[index].properties.takeoff_altitude, this.state.item.altitudeUnit);

    const newItem = Object.assign({}, this.state.item, {
      name: name,
      coordinates: Util.coordinatesToString({ lat: lat, lng: lng }),
      launchAltitude: alt
    });

    this.setState({ item: newItem }, () => {
      this.updateValidationErrors(this.getValidationErrors(true));
    });
    this.handleSiteProposalHide('all');

    dataService
      .getLocation(lat + ',' + lng)
      .then(response => {
        this.handleInputChange('location', Util.getLocationFromGoogleObject(response));
      });
  }

  /**
   * fetch and display proposal for launch site from paragliding.earth API for given coordinates.
   */
  fetchSiteProposal() {
    const markerPosition = this.getMarkerPosition();
    if (markerPosition) {
      const lat = markerPosition.lat;
      const lng = markerPosition.lng;
      // Distance.getDistanceInPilotUnits expects meters
      const dist = Distance.getDistanceInPilotUnits(this.state.proposalMaxDist * 1000);
      dataService
        .getSiteProposal(lat, lng, dist)
        .then(response => {
          if (response.type === 'FeatureCollection') {
            this.setState({ proposalError: null });
            if (response.features.length > 0) {
              this.setState({
                proposals: response.features,
                isSiteProposalsShown: new Array(response.features.length).fill(true)
              });
            } else {
              this.setState({
                proposals: [],
                isSiteProposalsShown: [ true ]
              });
            }
          } else {
          this.setState({ proposals: null });
          this.setState({ proposalError: 'ERROR: Unable to get site proposal: ' + JSON.stringify(response) });
          }
        })
        .catch(err => {
          this.setState({ proposals: null });
          this.setState({ proposalError: 'ERROR: Unable to get site proposal for ' + lat + '/' + lng + ': ' + JSON.stringify(err) });
        });
    }
  }

  getMarkerPosition() {
    if (!Util.isEmptyString(this.state.item.coordinates)) {
      // Hard validation in order to check coordinates format
      const validationErrors = this.getValidationErrors();
      // eslint-disable-next-line no-console
      console.error(validationErrors);
      if (!validationErrors || !validationErrors.coordinates) {
        // Change user input in { lat: 56.56734543, lng: 123.4567543 } format
        return Util.stringToCoordinates(this.state.item.coordinates);
      }
    }
    return null;
  }

  getValidationErrors(isSoft) {
    return Validation.getValidationErrors(
      SiteModel.getValidationConfig(),
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
        currentView={SiteModel.getModelKey()}
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
        leftButtonCaption={this.state.isMapShown ? 'Back' : 'Cancel'}
        rightButtonCaption={this.state.isMapShown ? null : 'Save'}
        onLeftClick={this.state.isMapShown ? this.handleMapHide : this.handleCancelEdit}
        onRightClick={this.state.isMapShown ? null : this.handleSubmit}
        isPositionFixed={!this.state.isInputInFocus}
      />
    );
  }

  renderMap() {
    if (!this.state.isMapShown) {
      return null;
    }

    DomUtil.scrollToTheTop();

    const markerPosition = this.getMarkerPosition();

    return (
      <InteractiveMap
        markerId={this.state.item.id}
        center={markerPosition || undefined}
        zoomLevel={markerPosition ? mapConstants.ZOOM_LEVEL.site : mapConstants.ZOOM_LEVEL.region}
        markerPosition={markerPosition || undefined}
        location={this.state.item.location}
        launchAltitude={this.state.item.launchAltitude}
        altitudeUnit={this.state.item.altitudeUnit}
        onDataApply={this.handleInputChange}
        onMapClose={this.handleMapHide}
      />
    );
  }

  renderSiteProposalNotices() {
    if (this.state.proposals) {
      if (this.state.proposals.length > 0) {
        const propNotices = [];
        for (const index in this.state.proposals) {
          if (this.state.isSiteProposalsShown[index]) {
            const proposalMessage = 'We found the site "' + this.state.proposals[index].properties.name +
                                    '" at ' + Distance.getDistanceInPilotUnits(this.state.proposals[index].properties.distance).toFixed(2) +
                                    Distance.getUserDistanceUnitShort() + ' distance';
            propNotices.push(
              <SiteProposalNotice
                key={index}
                text={proposalMessage}
                buttonText={'Use this data'}
                onClick={() => this.handleUseSiteProposal(index)}
                onClose={() => this.handleSiteProposalHide(index)}
              />
            );
          }
        }
        return propNotices;
      }
      // no proposals found
      if (this.state.proposals.length === 0 && this.state.isSiteProposalsShown[0]) {
        const proposalMessage = 'No site found within a distance of ' +
                                 this.state.proposalMaxDist + Distance.getUserDistanceUnitShort();
        return (
          <SiteProposalNotice
            key={0}
            text={proposalMessage}
            buttonText={'Increase search radius'}
            onClick={this.handleIncreaseProposalMaxDist}
            onClose={() => this.handleSiteProposalHide(0)}
          />
        );
      }
    }
    if (this.state.proposalError) {
      return (
        <SiteProposalNotice
          key={0}
          text={this.state.proposalError}
          onClose={() => this.handleSiteProposalHide(0)}
        />
      );
    }
    return null;
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
              Edit Site
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

            <SectionRow>
              <CoordinatesInput
                inputValue={this.state.item.coordinates}
                labelText='Coordinates:'
                errorMessage={this.state.validationErrors.coordinates}
                onChange={this.handleInputChange}
                onMapShow={this.handleMapShow}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionRow>
              <TextInput
                inputValue={this.state.item.location}
                labelText='Location:'
                inputName='location'
                errorMessage={this.state.validationErrors.location}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionRow>
              <AltitudeInput
                inputValue={this.state.item.launchAltitude}
                selectedAltitudeUnit={this.state.item.altitudeUnit}
                labelText='Launch altitude:'
                inputName='launchAltitude'
                errorMessage={this.state.validationErrors.launchAltitude}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionRow isLast={true}>
              <RemarksInput
                inputValue={this.state.item.remarks}
                labelText='Remarks:'
                errorMessage={this.state.validationErrors.remarks}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            {this.renderSiteProposalNotices()}

            {this.renderDesktopButtons()}

            {this.renderMap()}

          </Section>

          {this.renderMobileButtons()}
        </form>

        {this.renderNavigationMenu()}
      </View>
    );
  }
}


SiteEditView.propTypes = {
  match: shape({
    params: shape({
      id: string // url args
    })
  }).isRequired
};
