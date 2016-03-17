'use strict';

var React = require('react');
var Router = require('react-router');
var History = Router.History;
var Link = Router.Link;

var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var PilotModel = require('../../models/pilot');

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

    mixins: [ History ],

    getInitialState: function() {
        return {
            password: '',
            newPassword: '',
            passwordConfirm: '',
            error: null,
            isSaving: false,
            successNotice: false,
            isUserActivated: PilotModel.getUserActivationStatus()
        };
    },

    componentWillMount: function() {
        PilotModel.hideActivationNotice();
    },

    handleStoreModified: function() {
        PilotModel.hideActivationNotice();
        this.setState({ isUserActivated: PilotModel.getUserActivationStatus() });
    },

    handleInputChange: function(inputName, inputValue) {
        this.setState({ [inputName]: inputValue });
    },

    handleToPilotView: function() {
        this.history.pushState(null, '/pilot');
    },

    handleToResetPassword: function() {
        this.history.pushState(null, '/reset-password');
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

            PilotModel
                .changePassword(this.state.password, this.state.newPassword)
                .then(() => {
                    this.setState({
                        successNotice: true,
                        isSaving: false
                    });
                })
                .catch((error) => {
                    this.handleSavingError(error);
                });
        } else {
            this.handleSavingError(validationResponse);
        }
    },

    handleSavingError: function(error) {
        this.setState({
            error: error,
            isSaving: false
        });
    },

    validateForm: function() {
        if (this.state.password === null || this.state.password.trim() === '' ||
            this.state.newPassword === null || this.state.newPassword.trim() === ''
        ) {
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'All fields are required');
        }

        if (this.state.newPassword !== this.state.passwordConfirm) {
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'New password and confirmed password must be the same');
        }

        return true;
    },

    renderEmailVerificationNotice: function() {
        // false comparison because isUserActivated can be null if no pilot info in front end yet
        if (this.state.isUserActivated === false) {
            var noticeText = [
                'You need to verify your email before changing your password.',
                'Follow the link we sent you.'
            ].join(' ');

            return <EmailVerificationNotice text={ noticeText } type='error' />;
        }
    },

    renderError: function() {
        if (this.state.error !== null) {
            return <ErrorBox error={ this.state.error } />;
        }
    },

    renderSaveButton: function() {
        return (
            <Button
                caption={ this.state.isSaving ? 'Saving...' : 'Save' }
                type='submit'
                buttonStyle='primary'
                onClick={ this.handleSubmit }
                isEnabled={ !this.state.isSaving }
                />
        );
    },

    renderCancelButton: function() {
        return (
            <Button
                caption='Cancel'
                buttonStyle='secondary'
                onClick={ () => this.handleToPilotView() }
                isEnabled={ !this.state.isSaving }
                />
        );
    },


    render: function() {
        if (this.state.successNotice) {
            return <Notice text='Your password was successfully changed' type='success' />;
        }

        var isEnabled = this.state.isUserActivated && !this.state.isSaving;

        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.error }>
                <MobileTopMenu
                    leftButtonCaption='Back'
                    rightButtonCaption='Save'
                    onLeftClick={ () => this.handleToPilotView() }
                    onRightClick={ this.handleSubmit }
                    />
                <NavigationMenu currentView={ PilotModel.getModelKey() } />

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
                                />
                        </SectionRow>

                        <SectionRow>
                            <PasswordInput
                                inputValue={ this.state.newPassword }
                                labelText='New Password:'
                                inputName='newPassword'
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

                        <DesktopBottomGrid
                            leftElements={ [
                                this.renderSaveButton(),
                                this.renderCancelButton()
                            ] }
                            />

                        <SectionRow isDesktopOnly={ true } isLast={ true }>
                            <Link to='/reset-password'>Forgot Password?</Link>
                        </SectionRow>
                    </Section>

                    <MobileButton
                        caption={ this.state.isSaving ? 'Saving...' : 'Save' }
                        type='submit'
                        buttonStyle='primary'
                        onClick={ this.handleSubmit }
                        isEnabled={ isEnabled }
                        />

                    <MobileButton
                        caption='Forgot Password?'
                        onClick={ () => this.handleToResetPassword() }
                        />
                </form>
                </CompactContainer>
            </View>
        );
    }
});


module.exports = PilotChangePassword;
