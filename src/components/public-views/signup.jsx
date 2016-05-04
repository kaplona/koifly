'use strict';

var React = require('react');

var dataService = require('../../services/data-service');
var PublicViewMixin = require('../mixins/public-view-mixin');
var Util = require('../../utils/util');

var AppLink = require('../common/app-link');
var Button = require('../common/buttons/button');
var CompactContainer = require('../common/compact-container');
var Description = require('../common/section/description');
var DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var MobileButton = require('../common/buttons/mobile-button');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var PasswordInput = require('../common/inputs/password-input');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var TextInput = require('../common/inputs/text-input');



var Signup = React.createClass({

    mixins: [ PublicViewMixin ],

    getInitialState: function() {
        return {
            email: '',
            password: '',
            passwordConfirm: '',
            isSubscribed: false,
            error: null,
            isSending: false
        };
    },

    handleCheckboxChange: function() {
        this.setState({ isSubscribed: !this.state.isSubscribed });
    },

    handleSubmit: function(event) {
        if (event) {
            event.preventDefault();
        }

        var validationError = this.getValidationError();
        if (validationError) {
            this.updateError(validationError);
            return;
        }

        // If no errors
        this.setState({
            isSending: true,
            error: null
        });

        var pilotCredentials = {
            email: this.state.email,
            password: this.state.password,
            isSubscribed: this.state.isSubscribed
        };

        dataService
            .createPilot(pilotCredentials)
            .then(() => this.handleGoToPilotView())
            .catch(error => this.updateError(error));
    },

    getValidationError: function() {
        if (Util.isEmptyString(this.state.email) || Util.isEmptyString(this.state.password)) {
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'All fields are required');
        }

        if (this.state.password !== this.state.passwordConfirm) {
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'password and confirmed password must be the same');
        }

        return null;
    },

    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                header='Koifly'
                rightButtonCaption='Log In'
                onRightClick={ this.handleGoToLogin }
                isPositionFixed={ !this.state.isInputInFocus }
                />
        );
    },

    renderDesktopButtons: function() {
        return <DesktopBottomGrid leftElements={ [ this.renderSendButton() ] } />;
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

    renderMobileButtons: function() {
        return (
            <MobileButton
                caption={ this.state.isSending ? 'Saving...' : 'Sign Up' }
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
                { this.renderMobileTopMenu() }

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
                                    isEmail={ true }
                                    onChange={ this.handleInputChange }
                                    onFocus={ this.handleInputFocus }
                                    onBlur={ this.handleInputBlur }
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
                                    onFocus={ this.handleInputFocus }
                                    onBlur={ this.handleInputBlur }
                                    />
                            </SectionRow>

                            <SectionRow isLast={ true }>
                                <PasswordInput
                                    inputValue={ this.state.passwordConfirm }
                                    labelText='Confirm password:'
                                    inputName='passwordConfirm'
                                    onChange={ this.handleInputChange }
                                    onFocus={ this.handleInputFocus }
                                    onBlur={ this.handleInputBlur }
                                    />
                            </SectionRow>

                            <SectionRow isLast={ true }>
                                <Description>
                                    <input
                                        type='checkbox'
                                        checked={ this.state.isSubscribed }
                                        onChange={ this.handleCheckboxChange }
                                        />
                                    Yes, let me know once new features will be added
                                </Description>
                            </SectionRow>

                            { this.renderDesktopButtons() }

                            <SectionRow isDesktopOnly={ true } isLast={ true } >
                                <AppLink onClick={ this.handleGoToLogin }>Have an Account? Log in now!</AppLink>
                            </SectionRow>
                        </Section>

                        { this.renderMobileButtons() }
                    </form>
                </CompactContainer>

                { this.renderNavigationMenu() }
            </div>
        );
    }
});


module.exports = Signup;
