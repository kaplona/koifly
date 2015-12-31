'use strict';

var React = require('react');
var DataService = require('../services/data-service');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var Button = require('./common/button');
var PasswordInput = require('./common/password-input');
var Notice = require('./common/notice');
var ErrorBox = require('./common/error-box');


var ResetPass = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            pilotId: React.PropTypes.string.isRequired,
            token: React.PropTypes.string.isRequired
        })
    },

    getInitialState: function() {
        return {
            password: null,
            passwordConfirm: null,
            error: null,
            isSaving: false,
            successNotice: false
        };
    },

    handleSubmit: function(event) {
        if (event) {
            event.preventDefault();
        }

        var validationResponse = this.validateForm();
        // If no errors
        if (validationResponse === true) {
            this.setState({
                isSaving: true,
                error: null
            });

            var password = this.state.password;
            var pilotId = this.props.params.pilotId;
            var token = this.props.params.token;
            DataService.resetPass(password, pilotId, token).then(() => {
                this.setState({ successNotice: true });
            }).catch((error) => {
                this.handleSavingError(error);
            });
        } else {
            this.handleSavingError(validationResponse);
        }
    },

    handleInputChange: function(inputName, inputValue) {
        this.setState({ [inputName]: inputValue });
    },

    handleSavingError: function(error) {
        this.setState({
            error: error,
            isSaving: false
        });
    },

    validateForm: function() {
        if (this.state.password === null && this.state.password.trim() === '') {
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
        if (this.state.successNotice) {
            return <Notice text='Your password was successfully reset' type='success' />;
        }

        return (
            <div>
                { this.renderError() }
                <form onSubmit={ this.handleSubmit }>
                    <PasswordInput
                        inputValue={ this.state.password }
                        labelText='New Password:'
                        inputName='password'
                        onChange={ this.handleInputChange }
                        />

                    <PasswordInput
                        inputValue={ this.state.passwordConfirm }
                        labelText='Confirm password::'
                        inputName='passwordConfirm'
                        onChange={ this.handleInputChange }
                        />

                    <Button type='submit' active={ !this.state.isSaving }>
                        { this.state.isSaving ? 'Saving ...' : 'Save' }
                    </Button>
                </form>
            </div>
        );
    }
});


module.exports = ResetPass;
