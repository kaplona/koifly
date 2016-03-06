'use strict';

var React = require('react');
var History = require('react-router').History;
var _ = require('lodash');
var Map = require('../../utils/map');
var SiteModel = require('../../models/site');
var Validation = require('../../utils/validation');
var View = require('./../common/view');
var TopMenu = require('../common/menu/top-menu');
var BottomMenu = require('../common/menu/bottom-menu');
var BottomButtons = require('../common/buttons/bottom-buttons');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionButton = require('../common/buttons/section-button');
var InteractiveMap = require('./../common/maps/interactive-map');
var TextInput = require('./../common/inputs/text-input');
var AltitudeInput = require('./../common/inputs/altitude-input');
var RemarksInput = require('./../common/inputs/remarks-input');
var Loader = require('./../common/loader');
var Linkish = require('./../common/linkish');
var Button = require('../common/buttons/button');
var ErrorBox = require('./../common/notice/error-box');
var ErrorTypes = require('../../errors/error-types');


var SiteEditView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            siteId: React.PropTypes.string
        })
    },

    mixins: [ History ],

    getInitialState: function() {
        return {
            site: null,
            errors: _.clone(SiteEditView.formFields),
            isMapShown: false,
            //markerPosition: null,
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

        this.setState({ isMapShown: false });
        var validationResponse = this.validateForm();
        this.updateErrorState(validationResponse);
        // If no errors
        if (validationResponse === true) {
            this.setState({ isSaving: true });

            SiteModel.saveSite(this.state.site).then(() => {
                this.handleCancelEditing();
            }).catch((error) => {
                this.handleSavingError(error);
            });
        }
    },

    handleDeleteSite: function() {
        var alertMessage = 'We will delete this site from all flight records';

        if (window.confirm(alertMessage)) {
            this.setState({ isDeleting: true });
            SiteModel.deleteSite(this.props.params.siteId).then(() => {
                this.history.pushState(null, '/sites');
            }).catch((error) => {
                this.handleDeletingError(error);
            });
        }
    },

    handleInputChange: function(inputName, inputValue) {
        var newSite = _.extend({}, this.state.site, { [inputName]: inputValue });
        this.setState({ site: newSite }, function() {
            var validationResponse = this.validateForm(true);
            this.updateErrorState(validationResponse);
        });
    },

    handleCancelEditing: function() {
        if (this.state.isMapShown) {
            this.handleMapHide();
        } else {
            this.history.pushState(
                null,
                this.props.params.siteId ? ('/site/' + this.props.params.siteId) : '/sites'
            );
        }
    },

    handleSavingError: function(error) {
        var newError = null;
        if (error.type === ErrorTypes.VALIDATION_ERROR) {
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

    handleMapShow: function() {
        this.setState({ isMapShown: true });
    },

    handleMapHide: function() {
        this.setState({ isMapShown: false });
    },

    handleDataModified: function() {
        // If waiting for server response
        // ignore any other data updates
        if (this.state.isSaving || this.state.isDeleting) {
            return;
        }

        // Fetch site
        var site = SiteModel.getSiteOutput(this.props.params.siteId);

        // Check for errors
        if (site !== null && site.error) {
            this.setState({ loadingError: site.error });
            return;
        }

        // If there is user input in the form
        // erase processing errors
        // need this for handling successful authentication
        if (this.state.site !== null) {
            this.setState({
                savingError: null,
                deletingError: null
            });
            return;
        }

        //var markerPosition = (site !== null) ? SiteModel.getLatLngCoordinates(this.props.params.siteId) : null;
        this.setState({
            site: site,
            //markerPosition: markerPosition,
            loadingError: null
        });
    },

    validateForm: function(isSoft) {
        var validationResponse = Validation.validateForm(
            SiteModel.getValidationConfig(),
            this.state.site,
            isSoft
        );
        return validationResponse;
    },

    updateErrorState: function(newErrors) {
        var newErrorState = _.extend({}, SiteEditView.formFields, newErrors);
        this.setState({ errors: newErrorState });
    },

    getMarkerPosition: function() {
        if (this.state.site.coordinates.trim() !== '') {
            // Hard validation in order to check coordinates format
            var validationRespond = this.validateForm();
            if (validationRespond === true || validationRespond.coordinates === undefined) {
                // Change user input in { lat: 56.56734543, lng: 123.4567543 } format
                return SiteModel.formCoordinatesInput(this.state.site.coordinates);
            }
        }
        return null;
    },

    renderError: function() {
        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <TopMenu
                    leftText='Cancel'
                    onLeftClick={ this.handleCancelEditing }
                    />
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>
                <BottomMenu isSiteView={ true } />
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
                    onTryAgain={ this.handleDeleteSite }
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
                <BottomMenu isSiteView={ true } />
            </View>
        );
    },

    renderDeleteSectionButton: function() {
        if (this.props.params.siteId) {
            var isEnabled = (!this.state.isSaving && !this.state.isDeleting);
            return (
                <SectionButton
                    text={ this.state.isDeleting ? 'Deleting...' : 'Delete' }
                    buttonStyle='warning'
                    onClick={ this.handleDeleteSite }
                    isEnabled={ isEnabled }
                    />
            );
        }
    },

    renderDeleteButton: function() {
        if (this.props.params.siteId) {
            var isEnabled = (!this.state.isSaving && !this.state.isDeleting);
            return (
                <Button
                    text={ this.state.isDeleting ? 'Deleting...' : 'Delete' }
                    buttonStyle='warning'
                    onClick={ this.handleDeleteSite }
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

    renderMap: function() {
        if (!this.state.isMapShown) {
            return null;
        }

        var markerId = this.props.params.siteId ? this.props.params.siteId : 'new';
        var markerPosition = this.getMarkerPosition();

        if (markerPosition !== null) {
            return (
                <InteractiveMap
                    markerId={ markerId }
                    center={ markerPosition }
                    zoomLevel={ Map.zoomLevel.site }
                    markerPosition={ markerPosition }
                    location={ this.state.site.location }
                    launchAltitude={ this.state.site.launchAltitude }
                    altitudeUnit={ this.state.site.altitudeUnit }
                    onDataApply={ this.handleInputChange }
                    onMapClose={ this.handleMapHide }
                    />
            );
        }

        return (
            <InteractiveMap
                markerId={ markerId }
                markerPosition={ markerPosition }
                location={ this.state.site.location }
                launchAltitude={ this.state.site.launchAltitude }
                altitudeUnit={ this.state.site.altitudeUnit }
                onDataApply={ this.handleInputChange }
                onMapClose={ this.handleMapHide }
                />
        );
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.site === null) {
            return this.renderLoader();
        }

        var processingError = this.state.savingError ? this.state.savingError : this.state.deletingError;
        var isEnabled = (!this.state.isSaving && !this.state.isDeleting);
        var mapLink = <Linkish onClick={ this.handleMapShow }>or use a map</Linkish>;

        return (
            <View onDataModified={ this.handleDataModified } error={ processingError }>
                <TopMenu
                    leftText={ this.state.isMapShown ? 'Back' : 'Cancel' }
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
                                inputValue={ this.state.site.name }
                                labelText={ <span>Name<sup>*</sup>:</span> }
                                inputName='name'
                                errorMessage={ this.state.errors.name }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow>
                            <TextInput
                                inputValue={ this.state.site.location }
                                labelText='Location:'
                                inputName='location'
                                errorMessage={ this.state.errors.location }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow>
                            <TextInput
                                inputValue={ this.state.site.coordinates }
                                labelText='Coordinates:'
                                inputName='coordinates'
                                errorMessage={ this.state.errors.coordinates }
                                onChange={ this.handleInputChange }
                                afterComment={ mapLink }
                                />
                        </SectionRow>

                        <SectionRow>
                            <AltitudeInput
                                inputValue={ this.state.site.launchAltitude }
                                selectedAltitudeUnit={ this.state.site.altitudeUnit }
                                labelText='Launch altitude:'
                                inputName='launchAltitude'
                                errorMessage={ this.state.errors.launchAltitude }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow isLast={ true }>
                            <RemarksInput
                                inputValue={ this.state.site.remarks }
                                labelText='Remarks:'
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

                        { this.renderMap() }

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

                <BottomMenu isSiteView={ true } />
            </View>
        );
    }
});


SiteEditView.formFields = {
    name: null,
    launchAltitude: null,
    location: null,
    coordinates: null,
    remarks: null
};


module.exports = SiteEditView;
