'use strict';

var React = require('react');
var Link = require('react-router').Link;
var PilotModel = require('../models/pilot');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var View = require('./common/view');
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
            successNotice: false
        };
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

    validateForm: function() {
        if (this.state.password === null && this.state.password.trim() === '' ||
            this.state.newPassword === null && this.state.newPassword.trim() === ''
        ) {
            return new KoiflyError(ErrorTypes.VALIDATION_FAILURE, 'All fields are required');
        }

        if (this.state.newPassword !== this.state.passwordConfirm) {
            return new KoiflyError(ErrorTypes.VALIDATION_FAILURE, 'New password and confirmed password must be the same');
        }

        return true;
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

        return (
            <View error={ this.state.error }>
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

                    <Button type='submit' active={ !this.state.isSaving }>
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
