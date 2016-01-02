'use strict';

var React = require('react');
var Link = require('react-router').Link;
var PilotModel = require('../models/pilot');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var View = require('./common/view');
var EmailVerificationNotice = require('./common/email-verification-notice');
var PasswordInput = require('./common/password-input');
var Button = require('./common/button');
var ErrorBox = require('./common/error-box');
var Notice = require('./common/notice');


var PilotChangePass = React.createClass({

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
                this.setState({ successNotice: true });
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


    render: function() {
        if (this.state.successNotice) {
            return <Notice text='Your password was successfully changed' type='success' />;
        }

        var isSavingButtonActive = this.state.isUserActivated && !this.state.isSaving;

        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.error }>
                { this.renderEmailVerificationNotice() }
                { this.renderError() }
                <form onSubmit={ this.handleSubmit }>
                    <PasswordInput
                        inputValue={ this.state.password }
                        labelText='Old Password:'
                        inputName='password'
                        onChange={ this.handleInputChange }
                        />

                    <PasswordInput
                        inputValue={ this.state.newPassword }
                        labelText='New Password:'
                        inputName='newPassword'
                        onChange={ this.handleInputChange }
                        />

                    <PasswordInput
                        inputValue={ this.state.passwordConfirm }
                        labelText='Confirm password::'
                        inputName='passwordConfirm'
                        onChange={ this.handleInputChange }
                        />

                    <Button type='submit' active={ isSavingButtonActive }>
                        { this.state.isSaving ? 'Saving ...' : 'Save' }
                    </Button>

                    <div>
                        Forgot your password? <Link to='/reset-pass'>Reset password</Link>
                    </div>
                </form>
            </View>
        );
    }
});


module.exports = PilotChangePass;
