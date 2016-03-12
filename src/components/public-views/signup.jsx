'use strict';

var React = require('react');
var Router = require('react-router');
var History = Router.History;
var Link = Router.Link;

var DataService = require('../../services/data-service');

var Button = require('../common/buttons/button');
var CompactContainer = require('../common/compact-container');
var Description = require('../common/section/description');
var DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var MobileButton = require('../common/buttons/mobile-button');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var Notice = require('../common/notice/notice');
var PasswordInput = require('../common/inputs/password-input');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var TextInput = require('../common/inputs/text-input');


var Signup = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            email: '',
            password: '',
            passwordConfirm: '',
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
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'All fields are required');
        }

        if (this.state.password !== this.state.passwordConfirm) {
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'password and confirmed password must be the same');
        }

        return true;
    },

    renderError: function() {
        if (this.state.error !== null) {
            return <Notice type='error' text={ this.state.error.message } />;
        }
    },

    renderSendButton: function() {
        return (
            <Button
                caption={ this.state.isSending ? 'Sending...' : 'Sign up' }
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
                <MobileTopMenu
                    header='Koifly'
                    rightButtonCaption='Log In'
                    onRightClick={ this.handleToLogin }
                    />
                <NavigationMenu isMobile={ true } />

                <CompactContainer>
                <form>
                    { this.renderError() }

                    <Section>

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

                        <DesktopBottomGrid leftElements={ [ this.renderSendButton() ] } />

                        <SectionRow isDesktopOnly={ true } isLast={ true } >
                            <Link to='/login'>Have an Account? Log in now!</Link>
                        </SectionRow>
                    </Section>

                    <MobileButton
                        caption={ this.state.isSending ? 'Saving...' : 'Sign Up' }
                        type='submit'
                        buttonStyle='primary'
                        onClick={ this.handleSubmit }
                        isEnabled={ !this.state.isSaving }
                        />
                </form>
                </CompactContainer>
            </div>
        );
    }
});


module.exports = Signup;
