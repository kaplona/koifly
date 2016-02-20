'use strict';

var React = require('react');
var Router = require('react-router');
var History = Router.History;
var Link = Router.Link;
var DataService = require('../services/data-service');
var TopMenu = require('./common/menu/top-menu');
var BottomMenu = require('./common/menu/bottom-menu');
var BottomButtons = require('./common/buttons/bottom-buttons');
var Section = require('./common/section/section');
var SectionTitle = require('./common/section/section-title');
var SectionRow = require('./common/section/section-row');
var SectionButton = require('./common/buttons/section-button');
var TextInput = require('./common/inputs/text-input');
var PasswordInput = require('./common/inputs/password-input');
var Button = require('./common/buttons/button');
var Notice = require('./common/notice/notice');
var Description = require('./common/description');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


var Signup = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            email: null,
            password: null,
            passwordConfirm: null,
            isSubscribed: false,
            error: null,
            isSaving: false
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
            isSaving: true,
            error: null
        });

        var pilotCredentials = {
            email: this.state.email,
            password: this.state.password,
            isSubscribed: this.state.isSubscribed
        };

        DataService.createPilot(pilotCredentials).then(() => {
            this.history.pushState(null, '/pilot');
        }).catch((error) => {
            this.handleSavingError(error);
        });
    },

    handleToLogin: function() {
        this.history.pushState(null, '/login');
    },

    handleInputChange: function(inputName, inputValue) {
        this.setState({ [inputName]: inputValue });
    },

    handleCheckboxChange: function() {
        this.setState({ isSubscribed: !this.state.isSubscribed });
    },

    handleSavingError: function(error) {
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
            return <Notice type='validation' text={ this.state.error.message } />;
        }
    },

    renderSendButton: function() {
        return (
            <Button
                text={ this.state.isSending ? 'Sending...' : 'Sign up' }
                type='submit'
                buttonStyle='primary'
                onClick={ this.handleSubmit }
                isEnabled={ !this.state.isSending }
                />
        );
    },

    render: function() {
        return (
            <div>
                <TopMenu
                    headerText='Koifly'
                    rightText='Log In'
                    onRightClick={ this.handleToLogin }
                    />

                <form>
                    <Section isCompact={ true }>
                        { this.renderError() }

                        <SectionTitle>Sign up</SectionTitle>

                        <SectionRow>
                            <TextInput
                                inputValue={ this.state.email }
                                labelText='Email:'
                                inputName='email'
                                onChange={ this.handleInputChange }
                                />
                            <Description>
                                Your email will be used only for authorisation and won't be seen by anyone else
                            </Description>
                        </SectionRow>

                        <SectionRow>
                            <PasswordInput
                                inputValue={ this.state.password }
                                labelText='Password:'
                                inputName='password'
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow isLast={ true }>
                            <PasswordInput
                                inputValue={ this.state.passwordConfirm }
                                labelText='Confirm password:'
                                inputName='passwordConfirm'
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow isLast={ true }>
                            <Description>
                                <input
                                    type='checkbox'
                                    checked={ this.state.isSubscribed }
                                    onClick={ this.handleCheckboxChange }
                                    />
                                Yes, let me know once new features will be added
                            </Description>
                        </SectionRow>

                        <BottomButtons leftElements={ [ this.renderSendButton() ] } />

                        <SectionRow isDesktopOnly={ true } isLast={ true } >
                            <Link to='/login'>Have an Account? Log in now!</Link>
                        </SectionRow>
                    </Section>

                    <SectionButton
                        text={ this.state.isSending ? 'Saving...' : 'Sign Up' }
                        type='submit'
                        buttonStyle='primary'
                        onClick={ this.handleSubmit }
                        isEnabled={ !this.state.isSaving }
                        />
                </form>

                <BottomMenu isMobile={ true } />
            </div>
        );
    }
});


module.exports = Signup;
