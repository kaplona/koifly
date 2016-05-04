'use strict';

var React = require('react');

var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var PilotModel = require('../../models/pilot');
var PublicLinksMixin = require('../mixins/public-links-mixin');
var Util = require('../../utils/util');

var AppLink = require('../common/app-link');
var Button = require('../common/buttons/button');
var CompactContainer = require('../common/compact-container');
var DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
var EmailVerificationNotice = require('../common/notice/email-verification-notice');
var ErrorBox = require('../common/notice/error-box');
var MobileButton = require('../common/buttons/mobile-button');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var Notice = require('../common/notice/notice');
var PasswordInput = require('../common/inputs/password-input');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var View = require('../common/view');


var PilotChangePassword = React.createClass({

    mixins: [ PublicLinksMixin ],

    getInitialState: function() {
        return {
            password: '',
            newPassword: '',
            passwordConfirm: '',
            error: null,
            isSaving: false,
            successNotice: false,
            isUserActivated: true,
            isInputInFocus: false
        };
    },

    componentWillMount: function() {
        PilotModel.hideEmailVerificationNotice();
    },

    handleStoreModified: function() {
        this.setState({ isUserActivated: PilotModel.getUserActivationStatus() });
    },

    handleInputChange: function(inputName, inputValue) {
        this.setState({ [inputName]: inputValue });
    },

    handleInputFocus: function() {
        this.setState({ isInputInFocus: true });
    },

    handleInputBlur: function() {
        this.setState({ isInputInFocus: false });
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
            isSaving: true,
            error: null
        });

        PilotModel
            .changePassword(this.state.password, this.state.newPassword)
            .then(() => {
                this.setState({
                    successNotice: true,
                    isSaving: false
                });
            })
            .catch(error => this.updateError(error));
    },

    updateError: function(error) {
        this.setState({
            error: error,
            isSaving: false
        });
    },

    getValidationError: function() {
        if (Util.isEmptyString(this.state.password) || Util.isEmptyString(this.state.newPassword)) {
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'All fields are required');
        }

        if (this.state.newPassword !== this.state.passwordConfirm) {
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'New password and confirmed password must be the same');
        }

        return null;
    },

    isButtonsEnabled: function() {
        return this.state.isUserActivated && !this.state.isSaving;
    },

    renderEmailVerificationNotice: function() {
        if (!this.state.isUserActivated) {
            var noticeText = [
                'You need to verify your email before changing your password.',
                'Follow the link we sent you.'
            ].join(' ');

            return <EmailVerificationNotice text={ noticeText } type='error' />;
        }
    },
    
    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                leftButtonCaption='Back'
                rightButtonCaption='Save'
                onLeftClick={ this.handleGoToPilotView }
                onRightClick={ this.handleSubmit }
                isPositionFixed={ !this.state.isInputInFocus }
                />
        );
    },
    
    renderNavigationMenu: function() {
        return (
            <NavigationMenu
                currentView={ PilotModel.getModelKey() }
                isPositionFixed={ !this.state.isInputInFocus }
                />
        );
    },

    renderError: function() {
        if (this.state.error) {
            return <ErrorBox error={ this.state.error } />;
        }
    },

    renderDesktopButtons: function() {
        return (
            <DesktopBottomGrid
                leftElements={ [
                    this.renderSaveButton(),
                    this.renderCancelButton()
                ] }
                />
        );
    },

    renderSaveButton: function() {
        return (
            <Button
                caption={ this.state.isSaving ? 'Saving...' : 'Save' }
                type='submit'
                buttonStyle='primary'
                onClick={ this.handleSubmit }
                isEnabled={ this.isButtonsEnabled() }
                />
        );
    },

    renderCancelButton: function() {
        return (
            <Button
                caption='Cancel'
                buttonStyle='secondary'
                onClick={ this.handleGoToPilotView }
                isEnabled={ this.isButtonsEnabled() }
                />
        );
    },
    
    renderMobileButtons: function() {
        return (
            <div>
                <MobileButton
                    caption={ this.state.isSaving ? 'Saving...' : 'Save' }
                    type='submit'
                    buttonStyle='primary'
                    onClick={ this.handleSubmit }
                    isEnabled={ this.isButtonsEnabled() }
                    />

                <MobileButton
                    caption='Forgot Password?'
                    onClick={ this.handleGoToResetPassword }
                    />
            </div>
        );
    },

    renderSuccessNotice: function() {
        return (
            <div>
                { this.renderMobileTopMenu() }
                { this.renderNavigationMenu() }
                <Notice text='Your password was successfully changed' type='success' />
            </div>
        );
    },

    render: function() {
        if (this.state.successNotice) {
            return this.renderSuccessNotice();
        }
        
        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.error }>
                { this.renderMobileTopMenu() }

                <CompactContainer>
                    <form>
                        { this.renderEmailVerificationNotice() }
                        { this.renderError() }
                        
                        <Section>
                            <SectionTitle>Change Password</SectionTitle>
    
                            <SectionRow>
                                <PasswordInput
                                    inputValue={ this.state.password }
                                    labelText='Current Password:'
                                    inputName='password'
                                    onChange={ this.handleInputChange }
                                    onFocus={ this.handleInputFocus }
                                    onBlur={ this.handleInputBlur }
                                    />
                            </SectionRow>
    
                            <SectionRow>
                                <PasswordInput
                                    inputValue={ this.state.newPassword }
                                    labelText='New Password:'
                                    inputName='newPassword'
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
    
                            { this.renderDesktopButtons() }
    
                            <SectionRow isDesktopOnly={ true } isLast={ true }>
                                <AppLink onClick={ this.handleGoToResetPassword }>Forgot Password?</AppLink>
                            </SectionRow>
                        </Section>
    
                        { this.renderMobileButtons() }
                    </form>
                </CompactContainer>
                
                { this.renderNavigationMenu() }
            </View>
        );
    }
});


module.exports = PilotChangePassword;
