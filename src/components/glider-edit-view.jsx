'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var _ = require('lodash');
var GliderModel = require('../models/glider');
var Validation = require('../utils/validation');
var View = require('./common/view');
var Button = require('./common/button');
var TextInput = require('./common/text-input');
var TimeInput = require('./common/time-input');
var RemarksInput = require('./common/remarks-input');
var Loader = require('./common/loader');
var ErrorBox = require('./common/error-box');
var ErrorTypes = require('../utils/error-types');


var GliderEditView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            gliderId: React.PropTypes.string
        })
    },

    mixins: [ History ],

    getInitialState: function() {
        return {
            glider: null,
            errors: _.clone(GliderEditView.formFields),
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

            GliderModel.saveGlider(this.state.glider).then(() => {
                this.history.pushState(null, '/gliders');
            }).catch((error) => {
                this.handleSavingError(error);
            });

        }
    },

    handleDeleteGlider: function() {
        this.setState({ isDeleting: true });
        GliderModel.deleteGlider(this.props.params.gliderId).then(() => {
            this.history.pushState(null, '/gliders');
        }).catch((error) => {
            this.handleDeletingError(error);
        });
    },

    handleInputChange: function(inputName, inputValue) {
        var newGlider = _.extend({}, this.state.glider, { [inputName]: inputValue });
        this.setState({ glider: newGlider }, function() {
            this.validateForm(true);
        });
    },

    handleCancelEditing: function() {
        this.history.pushState(null, '/gliders');
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

        // Fetch glider
        var glider = GliderModel.getGliderEditOutput(this.props.params.gliderId);

        // Check for errors
        if (glider !== null && glider.error) {
            this.setState({ loadingError: glider.error });
            return;
        }

        // If there is user input in the form
        // erase processing errors
        // need this for handling successful authentication
        if (this.state.glider !== null) {
            this.setState({
                savingError: null,
                deletingError: null
            });
            return;
        }

        this.setState({
            glider: glider,
            loadingError: null
        });
    },

    validateForm: function(isSoft) {
        var validationResponse = Validation.validateForm(
            GliderModel.getValidationConfig(),
            this.state.glider,
            isSoft
        );
        this.updateErrorState(validationResponse);
        return validationResponse;
    },

    updateErrorState: function(newErrors) {
        var newErrorState = _.extend({}, GliderEditView.formFields, newErrors);
        this.setState({ errors: newErrorState });
    },

    renderError: function() {
        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>
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
                    onTryAgain={ this.handleDeleteGlider }
                    isTrying={ isTrying }
                    />
            );
        }
    },

    renderLoader: function() {
        var deleteButton = (this.props.params.gliderId) ? <Button active={ false }>Delete</Button> : '';
        return (
            <View onDataModified={ this.handleDataModified }>
                <Link to='/gliders'>Back to Gliders</Link>
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
        if (this.props.params.gliderId) {
            var isActive = (!this.state.isSaving && !this.state.isDeleting);
            return (
                <Button
                    onClick={ this.handleDeleteGlider }
                    active={ isActive }
                    >
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

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.glider === null) {
            return this.renderLoader();
        }

        var processingError = this.state.savingError ? this.state.savingError : this.state.deletingError;

        return (
            <View onDataModified={ this.handleDataModified } error={ processingError }>
                <Link to='/gliders'>Back to Gliders</Link>
                { this.renderSavingError() }
                { this.renderDeletingError() }
                <form onSubmit={ this.handleSubmit }>
                    <TextInput
                        inputValue={ this.state.glider.name }
                        labelText={ <span>Name<sup>*</sup>:</span> }
                        inputName='name'
                        errorMessage={ this.state.errors.name }
                        onChange={ this.handleInputChange }
                        />

                    <div>Glider usage before Koifly:</div>

                    <TextInput
                        inputValue={ this.state.glider.initialFlightNum }
                        labelText='Number of Flights:'
                        inputName='initialFlightNum'
                        errorMessage={ this.state.errors.initialFlightNum }
                        onChange={ this.handleInputChange }
                        />

                    <TimeInput
                        hours={ this.state.glider.hours }
                        minutes={ this.state.glider.minutes }
                        labelText='Airtime:'
                        errorMessage={ this.state.errors.initialAirtime }
                        errorMessageHours={ this.state.errors.hours }
                        errorMessageMinutes={ this.state.errors.minutes }
                        onChange={ this.handleInputChange }
                        />

                    <RemarksInput
                        inputValue={ this.state.glider.remarks }
                        labelText='Remarks'
                        errorMessage={ this.state.errors.remarks }
                        onChange={ this.handleInputChange }
                        />

                    { this.renderButtonMenu() }
                </form>
            </View>
        );
    }
});


GliderEditView.formFields = {
    name: null,
    initialFlightNum: null,
    initialAirtime: null,
    hours: null,
    minutes: null,
    remarks: null
};


module.exports = GliderEditView;
