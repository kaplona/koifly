'use strict';

var React = require('react');
var History = require('react-router').History;
var DataService = require('../../services/data-service');
var Section = require('./section');
var SectionTitle = require('./section-title');
var SectionRow = require('./section-row');
var SectionButton = require('./section-button');
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

    mixins: [ History ],

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
            setTimeout(() => this.handleSavingError(error), 2000);
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

    handleLinkTo: function(link) {
        this.history.pushState(null, link);
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
            <form>
                { this.renderNotice() }
                { this.renderError() }
                <Section>
                    <SectionTitle>Please, log in</SectionTitle>

                    <SectionRow>
                        <TextInput
                            inputValue={ this.state.email }
                            labelText='Email:'
                            inputName='email'
                            onChange={ this.handleInputChange }
                            />
                    </SectionRow>

                    <SectionRow isLast={ true }>
                        <PasswordInput
                            inputValue={ this.state.password }
                            labelText='Password:'
                            inputName='password'
                            onChange={ this.handleInputChange }
                            />
                    </SectionRow>
                </Section>

                <SectionButton
                    text={ this.state.isSending ? 'Sending...' : 'Log in' }
                    type='submit'
                    buttonStyle='primary'
                    onClick={ this.handleSubmit }
                    isEnabled={ !this.state.isSending }
                    />

                <SectionButton
                    text='Forgot Password?'
                    onClick={ () => this.handleLinkTo('/reset-pass') }
                    />

                <SectionButton
                    text='Log In With Email'
                    onClick={ this.handleEmailLogin }
                    />

                <SectionButton
                    text='Don&#39;t Have Account?'
                    onClick={ () => this.handleLinkTo('/signup') }
                    />
            </form>
        );
    }
});


module.exports = LoginForm;
