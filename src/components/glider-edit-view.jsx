'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var _ = require('underscore');
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
            savingInProcess: false
        };
    },

    handleSubmit: function(e) {
        e.preventDefault();
        var validationResponse = this.validateForm();
        // If no errors
        if (validationResponse === true) {
            this.setState({ savingInProcess: true });
            var newGlider =  _.clone(this.state.glider);
            newGlider.initialAirtime = parseInt(newGlider.hours) * 60 + parseInt(newGlider.minutes);
            GliderModel.saveGlider(newGlider).then(() => {
                this.history.pushState(null, '/gliders');
            }).catch((error) => {
                this.handleSavingError(error);
            });

        }
    },

    handleInputChange: function(inputName, inputValue) {
        var newGlider =  _.clone(this.state.glider);
        newGlider[inputName] = inputValue;
        this.setState({ glider: newGlider }, function() {
            this.validateForm(true);
        });
    },

    handleDeleteGlider: function() {
        this.setState({ savingInProcess: true });
        GliderModel.deleteGlider(this.props.params.gliderId).then(() => {
            this.history.pushState(null, '/gliders');
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
        this.history.pushState(null, '/gliders');
    },

    onDataModified: function() {
        // If waiting for server response
        // ignore any other data updates
        if (this.state.savingInProcess) {
            return;
        }

        // Fetch glider
        var glider;
        if (this.props.params.gliderId) {
            glider = GliderModel.getGliderOutput(this.props.params.gliderId);
        } else {
            glider = GliderModel.getNewGliderOutput();
        }

        // Check for errors
        if (glider !== null && glider.error) {
            // Create an empty site
            // in order to show to user an empty form
            // if error occurred
            var newGlider = this.state.glider;
            if (newGlider === null) {
                newGlider = this.createBlanckGlider();
            }
            this.setState({
                site: newGlider,
                loadingError: glider.error
            });
            return;
        }

        // Prepare glider output to show to user
        if (glider !== null) {
            glider.hours = Math.floor(glider.initialAirtime / 60);
            glider.minutes = glider.initialAirtime % 60;
        }
        this.setState({
            glider: glider,
            loadingError: null
        });
    },

    createBlanckGlider: function() {
        return {
            name: '',
            initialFlightNum: 0,
            initialAirtime: 0,
            hours: 0,
            minutes: 0,
            remarks: ''
        };
    },

    validateForm: function(softValidation) {
        var newGlider =  _.clone(this.state.glider);
        var validationResponse = Validation.validateForm(
                GliderModel.getValidationConfig(),
                newGlider,
                softValidation
        );
        this.updateErrorState(validationResponse);
        return validationResponse;
    },

    updateErrorState: function(newErrors) {
        var newErrorState = _.extend({}, GliderEditView.formFields, newErrors);
        this.setState({ errors: newErrorState });
    },

    renderError: function() {
        if (this.state.loadingError !== null) {
            return <ErrorBox error={ this.state.loadingError }/>;
        }
        return '';
    },

    renderLoader: function() {
        var deleteButton = (this.props.params.gliderId) ? <Button active={ false }>Delete</Button> : '';
        return (
            <View onDataModified={ this.onDataModified }>
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
            var buttonText = this.state.savingInProcess ? '...' : 'Delete';
            return (
                <Button
                    onClick={ this.handleDeleteGlider }
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

    render: function() {
        if (this.state.glider === null) {
            return this.renderLoader();
        }

        return (
            <View onDataModified={ this.onDataModified }>
                <Link to='/gliders'>Back to Gliders</Link>
                { this.renderError() }
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
