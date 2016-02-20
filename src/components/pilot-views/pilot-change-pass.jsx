'use strict';

var React = require('react');
var Router = require('react-router');
var History = Router.History;
var Link = Router.Link;
var PilotModel = require('../../models/pilot');
var KoiflyError = require('../../utils/error');
var ErrorTypes = require('../../utils/error-types');
var View = require('../common/view');
var TopMenu = require('../common/menu/top-menu');
var BottomMenu = require('../common/menu/bottom-menu');
var BottomButtons = require('../common/buttons/bottom-buttons');
var Section = require('../common/section/section');
var SectionTitle = require('../common/section/section-title');
var SectionRow = require('../common/section/section-row');
var SectionButton = require('../common/buttons/section-button');
var EmailVerificationNotice = require('./../common/notice/email-verification-notice');
var PasswordInput = require('../common/inputs/password-input');
var Button = require('../common/buttons/button');
var ErrorBox = require('../common/notice/error-box');
var Notice = require('../common/notice/notice');


var PilotChangePass = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            password: null,
            newPassword: null,
            passwordConfirm: null,
            error: null,
            isSaving: false,
            successNotice: false,
            isUserActivated: PilotModel.getUserActivationStatus()
        };
    },

    componentWillMount: function() {
        PilotModel.hideActivationNotice();
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

            PilotModel.changePass(this.state).then(() => {
                this.setState({
                    successNotice: true,
                    isSaving: false
                });
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

    handleLinkTo: function(link) {
        this.history.pushState(null, link);
    },

    handleSavingError: function(error) {
        this.setState({
            error: error,
            isSaving: false
        });
    },

    handleDataModified: function() {
        PilotModel.hideActivationNotice();
        this.setState({ isUserActivated: PilotModel.getUserActivationStatus() });
    },

    validateForm: function() {
        if (this.state.password === null || this.state.password.trim() === '' ||
            this.state.newPassword === null || this.state.newPassword.trim() === ''
        ) {
            return new KoiflyError(ErrorTypes.VALIDATION_FAILURE, 'All fields are required');
        }

        if (this.state.newPassword !== this.state.passwordConfirm) {
            return new KoiflyError(ErrorTypes.VALIDATION_FAILURE, 'New password and confirmed password must be the same');
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

            return <EmailVerificationNotice text={ noticeText } />;
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
                text={ this.state.isSaving ? 'Saving...' : 'Save' }
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
                text='Cancel'
                buttonStyle='secondary'
                onClick={ () => this.handleLinkTo('/pilot') }
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
            <View onDataModified={ this.handleDataModified } error={ this.state.error }>
                <TopMenu
                    leftText='Back'
                    rightText='Save'
                    onLeftClick={ () => this.handleLinkTo('/pilot') }
                    onRightClick={ this.handleSubmit }
                    />

                <form>
                    { this.renderEmailVerificationNotice() }
                    { this.renderError() }
                    <Section>
                        <SectionTitle>Change Password</SectionTitle>

                        <SectionRow>
                            <PasswordInput
                                inputValue={ this.state.password }
                                labelText='Old Password:'
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

                        <BottomButtons
                            leftElements={ [
                                this.renderSaveButton(),
                                this.renderCancelButton()
                            ] }
                            />

                        <SectionRow isDesktopOnly={ true } isLast={ true }>
                            <Link to='/reset-pass'>Forgot Password?</Link>
                        </SectionRow>
                    </Section>

                    <SectionButton
                        text={ this.state.isSaving ? 'Saving...' : 'Save' }
                        type='submit'
                        buttonStyle='primary'
                        onClick={ this.handleSubmit }
                        isEnabled={ isEnabled }
                        />

                    <SectionButton
                        text='Forgot Password?'
                        onClick={ () => this.handleLinkTo('/reset-pass') }
                        />
                </form>

                <BottomMenu isPilotView={ true } />
            </View>
        );
    }
});


module.exports = PilotChangePass;
