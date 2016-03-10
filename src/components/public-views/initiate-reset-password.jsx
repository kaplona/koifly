'use strict';

var React = require('react');
var History = require('react-router').History;

var DataService = require('../../services/data-service');
var PilotModel = require('../../models/pilot');


var Button = require('./../common/buttons/button');
var BottomButtons = require('./../common/buttons/bottom-buttons');
var BottomMenu = require('./../common/menu/bottom-menu');
var CompactContainer = require('./../common/compact-container');
var Description = require('./../common/section/description');
var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var Notice = require('./../common/notice/notice');
var Section = require('./../common/section/section');
var SectionButton = require('./../common/buttons/section-button');
var SectionRow = require('./../common/section/section-row');
var SectionTitle = require('./../common/section/section-title');
var TextInput = require('./../common/inputs/text-input');
var TopMenu = require('./../common/menu/top-menu');


var InitiateResetPassword = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            email: null,
            error: null,
            isSending: false,
            isEmailSent: false
        };
    },

    componentDidMount: function() {
        if (PilotModel.isLoggedIn()) {
            this.setState({ email: PilotModel.getEmailAddress() });
        }
    },

    handleSubmit: function(event) {
        if (event) {
            event.preventDefault();
        }

        if (this.state.email === null || this.state.email.trim() === '') {
            return this.handleSavingError(new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'Enter your email address'));
        }

        this.setState({
            isSending: true,
            error: null
        });

        DataService.initiateResetPassword(this.state.email).then(() => {
            this.setState({
                isSending: false,
                isEmailSent: true
            });
        }).catch((error) => {
            this.handleSavingError(error);
        });
    },

    handleLinkTo: function(link) {
        this.history.pushState(null, link);
    },

    handleInputChange: function(inputName, inputValue) {
        this.setState({ [inputName]: inputValue });
    },

    handleSavingError: function(error) {
        this.setState({
            error: error,
            isSending: false
        });
    },

    renderNotice: function() {
        if (this.state.isEmailSent) {
            var noticeText = 'Email with reset password link was successfully sent to ' + this.state.email;
            return <Notice text={ noticeText } />;
        }
    },

    renderSendButton: function() {
        return (
            <Button
                text={ this.state.isSending ? 'Sending...' : 'Send' }
                type='submit'
                buttonStyle='primary'
                onClick={ this.handleSubmit }
                isEnabled={ !this.state.isSending }
                />
        );
    },

    renderCancelButton: function() {
        return (
            <Button
                text='Cancel'
                buttonStyle='secondary'
                onClick={ () => this.handleLinkTo('/pilot') }
                isEnabled={ !this.state.isSending }
                />
        );
    },

    renderError: function() {
        if (this.state.error !== null) {
            return <Notice type='error' text={ this.state.error.message } />;
        }
    },

    render: function() {
        return (
            <div>
                <TopMenu
                    headerText='Koifly'
                    leftText='Back'
                    rightText='Sign Up'
                    onLeftClick={ () => this.handleLinkTo('/login') }
                    onRightClick={ () => this.handleLinkTo('/signup') }
                    />

                <CompactContainer>
                <form>

                    { this.renderNotice() }
                    { this.renderError() }

                    <Section>

                        <SectionTitle>Reset Password</SectionTitle>

                        <SectionRow>
                            <TextInput
                                inputValue={ this.state.email }
                                labelText='Email:'
                                inputName='email'
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow isLast={ true }>
                            <Description>
                                We will send you an email with a link to password reset page
                            </Description>
                        </SectionRow>

                        <BottomButtons
                            leftElements={ [
                                this.renderSendButton(),
                                this.renderCancelButton()
                            ] }
                            />
                    </Section>

                    <SectionButton
                        text={ this.state.isSending ? 'Sending...' : 'Send' }
                        type='submit'
                        buttonStyle='primary'
                        onClick={ this.handleSubmit }
                        isEnabled={ !this.state.isSending }
                        />
                </form>
                </CompactContainer>

                <BottomMenu isMobile={ true } />
            </div>
        );
    }
});


module.exports = InitiateResetPassword;
