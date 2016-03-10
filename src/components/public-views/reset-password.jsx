'use strict';

var React = require('react');
var History = require('react-router').History;

var DataService = require('../../services/data-service');

var BottomButtons = require('./../common/buttons/bottom-buttons');
var BottomMenu = require('./../common/menu/bottom-menu');
var Button = require('./../common/buttons/button');
var CompactContainer = require('./../common/compact-container');
var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var Notice = require('./../common/notice/notice');
var PasswordInput = require('./../common/inputs/password-input');
var Section = require('./../common/section/section');
var SectionButton = require('./../common/buttons/section-button');
var SectionRow = require('./../common/section/section-row');
var SectionTitle = require('./../common/section/section-title');
var TopMenu = require('./../common/menu/top-menu');


var ResetPassword = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            pilotId: React.PropTypes.string.isRequired,
            authToken: React.PropTypes.string.isRequired
        })
    },

    mixins: [ History ],

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
            var authToken = this.props.params.authToken;
            DataService.resetPassword(password, pilotId, authToken).then(() => {
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

                <CompactContainer>
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
                                labelText='Confirm password:'
                                inputName='passwordConfirm'
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <BottomButtons leftElements={ [ this.renderSaveButton() ] } />
                    </Section>

                    <SectionButton
                        text={ this.state.isSaving ? 'Saving ...' : 'Save' }
                        type='submit'
                        buttonStyle='primary'
                        onClick={ this.handleSubmit }
                        isEnabled={ !this.state.isSaving }
                        />
                </form>
                </CompactContainer>

                <BottomMenu isMobile={ true } />
            </div>
        );
    }
});


module.exports = ResetPassword;
