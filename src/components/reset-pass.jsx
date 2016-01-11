'use strict';

var React = require('react');
var DataService = require('../services/data-service');
var TopMenu = require('./common/menu/top-menu');
var BottomMenu = require('./common/menu/bottom-menu');
var Section = require('./common/section/section');
var SectionTitle = require('./common/section/section-title');
var SectionRow = require('./common/section/section-row');
var SectionButton = require('./common/section/section-button');
var PasswordInput = require('./common/inputs/password-input');
var Notice = require('./common/notice/notice');
var ErrorBox = require('./common/notice/error-box');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


var ResetPass = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            pilotId: React.PropTypes.string.isRequired,
            token: React.PropTypes.string.isRequired
        })
    },

    getInitialState: function() {
        return {
            password: null,
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

            var password = this.state.password;
            var pilotId = this.props.params.pilotId;
            var token = this.props.params.token;
            DataService.resetPass(password, pilotId, token).then(() => {
                this.setState({ successNotice: true });
            }).catch((error) => {
                this.handleSavingError(error);
            });
        } else {
            this.handleSavingError(validationResponse);
        }
    },

    handleToLogin: function() {
        this.history.pushState(null, '/login');
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
        if (this.state.password === null || this.state.password.trim() === '') {
            return new KoiflyError(ErrorTypes.VALIDATION_FAILURE, 'All fields are required');
        }

        if (this.state.password !== this.state.passwordConfirm) {
            return new KoiflyError(ErrorTypes.VALIDATION_FAILURE, 'password and confirmed password must be the same');
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
            return <Notice text='Your password was successfully reset' type='success' />;
        }

        return (
            <div>
                <TopMenu
                    headerText='Koifly'
                    rightText='Log in'
                    onRightClick={ this.handleToLogin }
                    />

                <form>
                    { this.renderError() }

                    <Section>
                        <SectionTitle>Reset Password</SectionTitle>

                        <SectionRow>
                            <PasswordInput
                                inputValue={ this.state.password }
                                labelText='New Password:'
                                inputName='password'
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow isLast={ true }>
                            <PasswordInput
                                inputValue={ this.state.passwordConfirm }
                                labelText='Confirm password::'
                                inputName='passwordConfirm'
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>
                    </Section>

                    <SectionButton
                        text={ this.state.isSaving ? 'Saving ...' : 'Save' }
                        type='submit'
                        buttonStyle='primary'
                        onClick={ this.handleSubmit }
                        isEnabled={ !this.state.isSaving }
                        />
                </form>

                <BottomMenu />
            </div>
        );
    }
});


module.exports = ResetPass;
