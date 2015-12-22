'use strict';

var React = require('react');
var Link = require('react-router').Link;
var PilotModel = require('../../models/pilot');
var Button = require('./button');
var TextInput = require('./text-input');
var PasswordInput = require('./password-input');
var Notice = require('./notice');
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
            isSending: false,
            isEmailSent: false
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

    handleEmailLogIn: function(event) {
        if (event) {
            event.preventDefault();
        }

        if (this.state.email === null || this.state.email.trim() === '') {
            return this.handleSavingError(new KoiflyError(ErrorTypes.VALIDATION_FAILURE, 'Enter your email address'));
        }

        this.setState({
            isSending: true,
            error: null
        });

        PilotModel.logInPilotByMail(this.state.email).then(() => {
            this.setState({
                isSending: false,
                isEmailSent: true
            });
        }).catch((error) => {
            this.handleSavingError(error);
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

    renderNotice: function() {
        if (this.state.isEmailSent) {
            return <Notice text='Email with verification link was successfully sent to you' />;
        }
    },

    renderError: function() {
        if (this.state.error !== null) {
            return <ErrorBox error={ this.state.error } />;
        }
    },

    render: function() {
        return (
            <div>
                { this.renderNotice() }
                { this.renderError() }
                <div className='container__subtitle'>Please, Log in</div>
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

                    <div>
                        Or you can one time log in just with
                        <a href='#' onClick={ this.handleEmailLogIn }> your email</a>
                    </div>

                    <div>
                        Don't have an account yet? <Link to='/signin'>Sign in</Link>
                    </div>
                </form>
            </div>
        );
    }
});


module.exports = LogInForm;
