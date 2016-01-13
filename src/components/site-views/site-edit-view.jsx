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
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionButton = require('../common/section/section-button');
var InteractiveMap = require('./../common/maps/interactive-map');
var TextInput = require('./../common/inputs/text-input');
var AltitudeInput = require('./../common/inputs/altitude-input');
var RemarksInput = require('./../common/inputs/remarks-input');
var Loader = require('./../common/loader');
var ErrorBox = require('./../common/notice/error-box');
var ErrorTypes = require('../../utils/error-types');


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
            markerPosition: null,
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

            SiteModel.saveSite(this.state.site).then(() => {
                this.history.pushState(null, '/sites');
            }).catch((error) => {
                this.handleSavingError(error);
            });
        }
    },

    handleDeleteSite: function() {
        this.setState({ isDeleting: true });
        SiteModel.deleteSite(this.props.params.siteId).then(() => {
            this.history.pushState(null, '/sites');
        }).catch((error) => {
            this.handleDeletingError(error);
        });
    },

    handleInputChange: function(inputName, inputValue) {
        var newSite = _.extend({}, this.state.site, { [inputName]: inputValue });
        this.setState({ site: newSite }, function() {
            this.validateForm(true);
        });
    },

    handleCancelEditing: function() {
        this.history.pushState(
            null,
            this.props.params.siteId ? ('/site/' + this.props.params.siteId) : '/sites'
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

        var markerPosition = (site !== null) ? SiteModel.getLatLngCoordinates(this.props.params.siteId) : null;
        this.setState({
            site: site,
            markerPosition: markerPosition,
            loadingError: null
        });
    },

    validateForm: function(isSoft) {
        var validationResponse = Validation.validateForm(
            SiteModel.getValidationConfig(),
            this.state.site,
            isSoft
        );
        this.updateErrorState(validationResponse);
        return validationResponse;
    },

    updateErrorState: function(newErrors) {
        var newErrorState = _.extend({}, SiteEditView.formFields, newErrors);
        this.setState({ errors: newErrorState });
    },

    dropPinByCoordinates: function() {
        if (this.state.site.coordinates.trim() !== '' &&
            this.state.errors.coordinates === ''
        ) {
            // Change user input in { lat: 56.56734543, lng: 123.4567543 } form
            var newCoordinates = SiteModel.formCoordinatesInput(this.state.site.coordinates);
            this.setState({ markerPosition: newCoordinates });
        }
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

    renderDeleteButton: function() {
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

    //renderButtonMenu: function() {
    //    var isEnabled = (!this.state.isSaving && !this.state.isDeleting);
    //    return (
    //        <div className='button__menu'>
    //            <Button type='submit' onClick={ this.handleSubmit } isEnabled={ isEnabled }>
    //                { this.state.isSaving ? 'Saving ...' : 'Save' }
    //            </Button>
    //            { this.renderDeleteButton() }
    //            <Button onClick={ this.handleCancelEditing } isEnabled={ isEnabled }>
    //                Cancel
    //            </Button>
    //        </div>
    //    );
    //},

    renderMap: function() {
        var markerId = this.props.params.siteId ? this.props.params.siteId : 'new';
        if (this.state.markerPosition !== null) {
            return (
                <InteractiveMap
                    markerId={ markerId }
                    center={ this.state.markerPosition }
                    zoomLevel={ Map.zoomLevel.site }
                    markerPosition={ this.state.markerPosition }
                    location={ this.state.site.location }
                    launchAltitude={ this.state.site.launchAltitude }
                    altitudeUnit={ this.state.site.altitudeUnit }
                    onDataApply={ this.handleInputChange }
                    />
            );
        }

        return (
            <InteractiveMap
                markerId={ markerId }
                markerPosition={ this.state.markerPosition }
                location={ this.state.site.location }
                launchAltitude={ this.state.site.launchAltitude }
                altitudeUnit={ this.state.site.altitudeUnit }
                onDataApply={ this.handleInputChange }
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
                            <AltitudeInput
                                inputValue={ this.state.site.launchAltitude }
                                selectedAltitudeUnit={ this.state.site.altitudeUnit }
                                labelText='Launch Altitude:'
                                inputName='launchAltitude'
                                errorMessage={ this.state.errors.launchAltitude }
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
                                onBlur={ this.dropPinByCoordinates }
                                />
                        </SectionRow>

                        <SectionRow isLast={ true }>
                            <RemarksInput
                                inputValue={ this.state.site.remarks }
                                labelText='Remarks'
                                errorMessage={ this.state.errors.remarks }
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        { this.renderMap() }
                    </Section>

                    <SectionButton
                        text={ this.state.isSaving ? 'Saving...' : 'Save' }
                        type='submit'
                        buttonStyle='primary'
                        onClick={ this.handleSubmit }
                        isEnabled={ isEnabled }
                        />

                    { this.renderDeleteButton() }
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
