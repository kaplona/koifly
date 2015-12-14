'use strict';

var React = require('react');
var PilotModel = require('../../models/pilot');
var Button = require('./button');
var TextInput = require('./text-input');
var PasswordInput = require('./password-input');
var ErrorBox = require('./error-box');
var KoiflyError = require('../../utils/error');
var ErrorTypes = require('../../utils/error-types');


var LogInForm = React.createClass({
    propTypes: {
        onLogIn: React.PropTypes.func
    },

    getInitialState: function() {
        return {
            email: null,
            password: null,
            error: null,
            isSending: false
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
                isSending: true,
                error: null
            });

            PilotModel.logInPilot(this.state).then(() => {
                if (this.props.onLogIn) {
                    this.props.onLogIn();
                }
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
        // TODO error message verbiage
        this.setState({
            error: error,
            isSending: false
        });
    },

    validateForm: function() {
        if (this.state.email === null || this.state.email.trim() === '' ||
            this.state.password === null && this.state.password.trim() === ''
        ) {
            return new KoiflyError(ErrorTypes.VALIDATION_FAILURE, 'All fields are required');
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
                <form onSubmit={ this.handleSubmit }>
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

                    <Button type='submit' active={ !this.state.isSending }>
                        { this.state.isSending ? 'Sending...' : 'Log in' }
                    </Button>
                </form>
            </div>
        );
    }
});


module.exports = LogInForm;
