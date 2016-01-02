'use strict';

var React = require('react');
var Link = require('react-router').Link;
var DataService = require('../../services/data-service');
var Button = require('./button');
var TextInput = require('./text-input');
var PasswordInput = require('./password-input');
var Notice = require('./notice');
var ErrorBox = require('./error-box');
var KoiflyError = require('../../utils/error');
var ErrorTypes = require('../../utils/error-types');


var LoginForm = React.createClass({
    propTypes: {
        onLogin: React.PropTypes.func
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
        if (validationResponse !== true) {
            return this.handleSavingError(validationResponse);
        }

        this.setState({
            isSending: true,
            error: null
        });

        var pilotCredentials = {
            email: this.state.email,
            password: this.state.password
        };
        DataService.loginPilot(pilotCredentials).then(() => {
            if (this.props.onLogin) {
                this.props.onLogin();
            }
        }).catch((error) => {
            this.handleSavingError(error);
        });
    },

    handleEmailLogin: function(event) {
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

        DataService.oneTimeLogin(this.state.email).then(() => {
            this.setState({
                isSending: false,
                isEmailSent: true
            });
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
            isSending: false
        });
    },

    validateForm: function() {
        if (this.state.email === null || this.state.email.trim() === '' ||
            this.state.password === null || this.state.password.trim() === ''
        ) {
            return new KoiflyError(ErrorTypes.VALIDATION_FAILURE, 'All fields are required');
        }

        return true;
    },

    renderNotice: function() {
        if (this.state.isEmailSent) {
            var noticeText = 'Email with verification link was successfully sent to ' + this.state.email;
            return <Notice text={ noticeText } />;
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

                    <Button type='submit' onClick={ this.handleSubmit } isEnabled={ !this.state.isSending }>
                        { this.state.isSending ? 'Sending...' : 'Log in' }
                    </Button>

                    <div>
                        Forgot your password? <Link to='/reset-pass'>Reset password</Link>
                    </div>

                    <div>
                        Or you can one time log in just with
                        <a href='#' onClick={ this.handleEmailLogin }> your email</a>
                    </div>

                    <div>
                        Don't have an account yet? <Link to='/signup'>Sign up</Link>
                    </div>
                </form>
            </div>
        );
    }
});


module.exports = LoginForm;
