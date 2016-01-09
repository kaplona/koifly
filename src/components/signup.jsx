'use strict';

var React = require('react');
var History = require('react-router').History;
var DataService = require('../services/data-service');
var Button = require('./common/button');
var TextInput = require('./common/inputs/text-input');
var PasswordInput = require('./common/inputs/password-input');
var ErrorBox = require('./common/notice/error-box');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


var Signup = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            email: null,
            password: null,
            passwordConfirm: null,
            error: null,
            isSaving: false
        };
    },

    componentWillMount: function() {
        // TODO check cookie and redirect to home page
    },

    handleSubmit: function(event) {
        if (event) {
            event.preventDefault();
        }

        var validationResponse = this.validateForm();
        if (validationResponse !== true) {
            return this.handleSavingError(validationResponse);
        }

        this.setState({
            isSaving: true,
            error: null
        });

        var pilotCredentials = {
            email: this.state.email,
            password: this.state.password
        };

        DataService.createPilot(pilotCredentials).then(() => {
            this.history.pushState(null, '/pilot');
        }).catch((error) => {
            this.handleSavingError(error);
        });
    },

    handleInputChange: function(inputName, inputValue) {
        this.setState({ [inputName]: inputValue });
    },

    handleSavingError: function(error) {
        // TODO error message verbiage
        this.setState({
            error: error,
            isSaving: false
        });
    },

    validateForm: function() {
        if (this.state.email === null || this.state.email.trim() === '' ||
            this.state.password === null || this.state.password.trim() === ''
        ) {
            return new KoiflyError(ErrorTypes.VALIDATION_FAILURE, 'All fields are required');
        }

        if (this.state.password !== this.state.passwordConfirm) {
            return new KoiflyError(ErrorTypes.VALIDATION_FAILURE, 'password and confirmed password must be the same');
        }

        return true;
    },

    renderError: function() {
        if (this.state.error !== null) {
            return <ErrorBox error={ this.state.error } />;
        }
    },

    render: function() {
        return (
            <div>
                { this.renderError() }
                <form>
                    <TextInput
                        inputValue={ this.state.email }
                        labelText='Email:'
                        inputName='email'
                        onChange={ this.handleInputChange }
                        />

                    <PasswordInput
                        inputValue={ this.state.password }
                        labelText='Password:'
                        inputName='password'
                        onChange={ this.handleInputChange }
                        />

                    <PasswordInput
                        inputValue={ this.state.passwordConfirm }
                        labelText='Confirm password:'
                        inputName='passwordConfirm'
                        onChange={ this.handleInputChange }
                        />

                    <Button type='submit' onClick={ this.handleSubmit } isEnabled={ !this.state.isSaving }>
                        { this.state.isSaving ? 'Saving ...' : 'Save' }
                    </Button>
                </form>
            </div>
        );
    }
});


module.exports = Signup;
