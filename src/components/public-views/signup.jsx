'use strict';

const React = require('react');
const AppLink = require('../common/app-link');
const Button = require('../common/buttons/button');
const CompactContainer = require('../common/compact-container');
const dataService = require('../../services/data-service');
const Description = require('../common/section/description');
const DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
const ErrorTypes = require('../../errors/error-types');
const KoiflyError = require('../../errors/error');
const MobileButton = require('../common/buttons/mobile-button');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const PasswordInput = require('../common/inputs/password-input');
const PublicViewMixin = require('../mixins/public-view-mixin');
const Section = require('../common/section/section');
const SectionRow = require('../common/section/section-row');
const SectionTitle = require('../common/section/section-title');
const TextInput = require('../common/inputs/text-input');
const Util = require('../../utils/util');


const Signup = React.createClass({

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

        const validationError = this.getValidationError();
        if (validationError) {
            this.updateError(validationError);
            return;
        }

        // If no errors
        this.setState({
            isSending: true,
            error: null
        });

        const pilotCredentials = {
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
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'Password and confirmed password must be the same');
        }

        return null;
    },

    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                header='Koifly'
                rightButtonCaption='Log In'
                onRightClick={this.handleGoToLogin}
                isPositionFixed={!this.state.isInputInFocus}
            />
        );
    },

    renderDesktopButtons: function() {
        return <DesktopBottomGrid leftElements={[ this.renderSendButton() ]} />;
    },

    renderSendButton: function() {
        return (
            <Button
                caption={this.state.isSending ? 'Sending...' : 'Sign up'}
                type='submit'
                buttonStyle='primary'
                onClick={this.handleSubmit}
                isEnabled={!this.state.isSending}
            />
        );
    },

    renderMobileButtons: function() {
        return (
            <MobileButton
                caption={this.state.isSending ? 'Saving...' : 'Sign Up'}
                type='submit'
                buttonStyle='primary'
                onClick={this.handleSubmit}
                isEnabled={!this.state.isSending}
            />
        );
    },

    render: function() {
        return (
            <div>
                {this.renderMobileTopMenu()}
                {this.renderError()}

                <CompactContainer>
                    <form>
                        <Section>

                            <SectionTitle>Sign up</SectionTitle>

                            <SectionRow>
                                <TextInput
                                    inputValue={this.state.email}
                                    labelText='Email:'
                                    inputName='email'
                                    isEmail={true}
                                    onChange={this.handleInputChange}
                                    onFocus={this.handleInputFocus}
                                    onBlur={this.handleInputBlur}
                                />
                                <Description>
                                    Your email will be used only for authorisation and won't be seen by anyone else
                                </Description>
                            </SectionRow>

                            <SectionRow>
                                <PasswordInput
                                    inputValue={this.state.password}
                                    labelText='Password:'
                                    inputName='password'
                                    onChange={this.handleInputChange}
                                    onFocus={this.handleInputFocus}
                                    onBlur={this.handleInputBlur}
                                />
                            </SectionRow>

                            <SectionRow isLast={true}>
                                <PasswordInput
                                    inputValue={this.state.passwordConfirm}
                                    labelText='Confirm password:'
                                    inputName='passwordConfirm'
                                    onChange={this.handleInputChange}
                                    onFocus={this.handleInputFocus}
                                    onBlur={this.handleInputBlur}
                                />
                            </SectionRow>

                            <SectionRow isLast={true}>
                                <Description>
                                    <input
                                        id='isSubscribed'
                                        type='checkbox'
                                        checked={this.state.isSubscribed}
                                        onChange={this.handleCheckboxChange}
                                    />
                                    <label htmlFor='isSubscribed'>
                                        Yes, let me know once new features will be added
                                    </label>
                                </Description>
                            </SectionRow>

                            {this.renderDesktopButtons()}

                            <SectionRow isDesktopOnly={true} isLast={true} >
                                <AppLink onClick={this.handleGoToLogin}>Have an Account? Log in now!</AppLink>
                            </SectionRow>
                        </Section>

                        {this.renderMobileButtons()}
                    </form>
                </CompactContainer>

                {this.renderNavigationMenu()}
            </div>
        );
    }
});


module.exports = Signup;
