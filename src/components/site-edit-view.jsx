'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var _ = require('underscore');
var Map = require('../utils/map');
var SiteModel = require('../models/site');
var Validation = require('../utils/validation');
var View = require('./common/view');
var InteractiveMap = require('./common/interactive-map');
var Button = require('./common/button');
var TextInput = require('./common/text-input');
var AltitudeInput = require('./common/altitude-input');
var RemarksInput = require('./common/remarks-input');
var Loader = require('./common/loader');
var ErrorBox = require('./common/error-box');
var ErrorTypes = require('../utils/error-types');


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
            var newSite =  _.clone(this.state.site);
            SiteModel.saveSite(newSite).then(() => {
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
        var newSite =  _.clone(this.state.site);
        newSite[inputName] = inputValue;
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
        var site;
        if (this.props.params.siteId) {
            site = SiteModel.getSiteOutput(this.props.params.siteId);
        } else {
            site = SiteModel.getNewSiteOutput();
        }

        // Check for errors
        if (site !== null && site.error) {
            this.setState({ loadingError: site.error });
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
        var newSite =  _.clone(this.state.site);
        var validationResponse = Validation.validateForm(
                SiteModel.getValidationConfig(),
                newSite,
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
        if (this.state.loadingError !== null) {
            return (
                <View onDataModified={ this.handleDataModified }>
                    <ErrorBox
                        error={ this.state.loadingError }
                        onTryAgain={ this.handleDataModified }
                        />
                </View>
            );
        }
        return '';
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
        var deleteButton = (this.props.params.siteId) ? <Button active={ false }>Delete</Button> : '';
        return (
            <View onDataModified={ this.handleDataModified }>
                <Link to='/sites'>Back to Sites</Link>
                <Loader />
                <div className='button__menu'>
                    <Button active={ false }>Save</Button>
                    { deleteButton }
                    <Button onClick={ this.handleCancelEditing }>Cancel</Button>
                </div>
            </View>
        );
    },

    renderDeleteButton: function() {
        if (this.props.params.siteId) {
            var isActive = (!this.state.isSaving && !this.state.isDeleting);
            return (
                <Button onClick={ this.handleDeleteSite } active={ isActive }>
                    { this.state.isDeleting ? 'Deleting ...' : 'Delete' }
                </Button>
            );
        }
    },

    renderButtonMenu: function() {
        var isActive = (!this.state.isSaving && !this.state.isDeleting);
        return (
            <div className='button__menu'>
                <Button type='submit' active={ isActive }>
                    { this.state.isSaving ? 'Saving ...' : 'Save' }
                </Button>
                { this.renderDeleteButton() }
                <Button onClick={ this.handleCancelEditing } active={ isActive }>
                    Cancel
                </Button>
            </div>
        );
    },

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

        return (
            <View onDataModified={ this.handleDataModified }>
                <Link to='/sites'>Back to Sites</Link>
                { this.renderSavingError() }
                { this.renderDeletingError() }
                <form onSubmit={ this.handleSubmit }>
                    <TextInput
                        inputValue={ this.state.site.name }
                        labelText={ <span>Name<sup>*</sup>:</span> }
                        inputName='name'
                        errorMessage={ this.state.errors.name }
                        onChange={ this.handleInputChange }
                        />

                    <TextInput
                        inputValue={ this.state.site.location }
                        labelText='Location:'
                        inputName='location'
                        errorMessage={ this.state.errors.location }
                        onChange={ this.handleInputChange }
                        />

                    <AltitudeInput
                        inputValue={ this.state.site.launchAltitude }
                        selectedAltitudeUnit={ this.state.site.altitudeUnit }
                        labelText='Launch Altitude:'
                        inputName='launchAltitude'
                        errorMessage={ this.state.errors.launchAltitude }
                        onChange={ this.handleInputChange }
                        />

                    <TextInput
                        inputValue={ this.state.site.coordinates }
                        labelText='Coordinates:'
                        inputName='coordinates'
                        errorMessage={ this.state.errors.coordinates }
                        onChange={ this.handleInputChange }
                        onBlur={ this.dropPinByCoordinates }
                        />

                    <RemarksInput
                        inputValue={ this.state.site.remarks }
                        labelText='Remarks'
                        errorMessage={ this.state.errors.remarks }
                        onChange={ this.handleInputChange }
                        />

                    { this.renderMap() }
                    { this.renderButtonMenu() }
                </form>
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
