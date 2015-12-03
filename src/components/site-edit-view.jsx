'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var $ = require('jquery');
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
            errors: {
                name: '',
                launchAltitude: '',
                location: '',
                coordinates: '',
                remarks: ''
            },
            markerPosition: null,
            loadingError: null,
            savingInProcess: false
        };
    },

    handleSubmit: function(e) {
        e.preventDefault();
        var validationResponse = this.validateForm();
        // If no errors
        if (validationResponse === true) {
            this.setState({ savingInProcess: true });
            var newSite =  _.clone(this.state.site);
            SiteModel.saveSite(newSite).then(() => {
                this.history.pushState(null, '/sites');
            }).catch((error) => {
                this.handleSavingError(error);
            });

        }
    },

    handleInputChange: function(inputName, inputValue) {
        var newSite =  _.clone(this.state.site);
        newSite[inputName] = inputValue;
        this.setState({ site: newSite }, function() {
            this.validateForm(true);
        });
    },

    handleDeleteSite: function() {
        this.setState({ savingInProcess: true });
        SiteModel.deleteSite(this.props.params.siteId).then(() => {
            this.history.pushState(null, '/sites');
        }).catch((error) => {
            this.handleSavingError(error);
        });
    },

    handleSavingError: function(error) {
        var loadingError = null;
        if (error.type === ErrorTypes.VALIDATION_FAILURE) {
            this.updateErrorState(error.errors);
        } else {
            loadingError = error;
        }
        this.setState({
            loadingError: loadingError,
            savingInProcess: false
        });
    },

    handleCancelEditing: function() {
        this.history.pushState(
            null,
            this.props.params.siteId ? ('/site/' + this.props.params.siteId) : '/sites'
        );
    },

    onDataModified: function() {
        // If waiting for server response
        // ignore any other data updates
        if (this.state.savingInProcess) {
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
            // Create an empty site
            // in order to show to user an empty form
            // if error occurred
            var newSite = this.state.site;
            if (newSite === null) {
                newSite = this.createBlanckSite();
            }
            this.setState({
                site: newSite,
                loadingError: site.error
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

    createBlanckSite: function() {
        return {
            name: '',
            launchAltitude: 0,
            location: '',
            coordinates: '',
            remarks: ''
        };
    },

    validateForm: function(softValidation) {
        var newSite =  _.clone(this.state.site);
        var validationResponse = Validation.validateForm(
                SiteModel.getValidationConfig(),
                newSite,
                softValidation
        );
        this.updateErrorState(validationResponse);
        return validationResponse;
    },

    updateErrorState: function(errorList) {
        var newErrorState =  _.clone(this.state.errors);
        $.each(newErrorState, (fieldName) => {
            newErrorState[fieldName] = errorList[fieldName] ? errorList[fieldName] : '';
        });
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
            return <ErrorBox error={ this.state.loadingError }/>;
        }
        return '';
    },

    renderLoader: function() {
        var deleteButton = (this.props.params.siteId) ? <Button active={ false }>Delete</Button> : '';
        return (
            <View onDataModified={ this.onDataModified }>
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
            var buttonText = this.state.savingInProcess ? '...' : 'Delete';
            return (
                <Button
                    onClick={ this.handleDeleteSite }
                    active={ !this.state.savingInProcess }
                    >
                    { buttonText }
                </Button>
            );
        }
        return '';
    },

    renderButtonMenu: function() {
        var saveButtonText = this.state.savingInProcess ? '...' : 'Save';
        var cancelButtonText = this.state.savingInProcess ? '...' : 'Cancel';
        return (
            <div className='button__menu'>
                <Button type='submit' active={ !this.state.savingInProcess }>
                    { saveButtonText }
                </Button>
                { this.renderDeleteButton() }
                <Button active={ !this.state.savingInProcess } onClick={ this.handleCancelEditing }>
                    { cancelButtonText }
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
                    altitudeUnits={ this.state.site.altitudeUnits }
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
                altitudeUnits={ this.state.site.altitudeUnits }
                onDataApply={ this.handleInputChange }
                />
        );
    },

    render: function() {
        if (this.state.site === null) {
            return this.renderLoader();
        }

        return (
            <View onDataModified={ this.onDataModified }>
                <Link to='/sites'>Back to Sites</Link>
                { this.renderError() }
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
                        selectedAltitudeUnit={ this.state.site.altitudeUnits }
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


module.exports = SiteEditView;
