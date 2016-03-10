'use strict';

var React = require('react');
var History = require('react-router').History;

var DataService = require('../../services/data-service');


var BottomButtons = require('./../common/buttons/bottom-buttons');
var BottomMenu = require('./../common/menu/bottom-menu');
var Button = require('./../common/buttons/button');
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


var OneTimeLogin = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            email: null,
            error: null,
            isSending: false,
            lastSentEmailAddress: null
        };
    },

    handleSubmit: function(event) {
        if (event) {
            event.preventDefault();
        }

        if (this.state.email === null || this.state.email.trim() === '') {
            return this.handleError(new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'Enter your email address'));
        }

        this.setState({
            isSending: true,
            error: null
        });

        var lastSentEmailAddress = this.state.email;
        DataService.oneTimeLogin(this.state.email).then(() => {
            this.setState({
                isSending: false,
                lastSentEmailAddress: lastSentEmailAddress
            });
        }).catch((error) => {
            this.handleError(error);
        });
    },

    handleToLogin: function() {
        this.history.pushState(null, '/login');
    },

    handleToSignup: function() {
        this.history.pushState(null, '/signup');
    },

    handleInputChange: function(inputName, inputValue) {
        this.setState({ [inputName]: inputValue });
    },

    handleError: function(error) {
        this.setState({
            error: error,
            isSending: false
        });
    },

    renderNotice: function() {
        if (this.state.lastSentEmailAddress) {
            var noticeText = 'Email with verification link was successfully sent to ' + this.state.lastSentEmailAddress;
            return <Notice text={ noticeText } />;
        }
    },

    renderError: function() {
        if (this.state.error !== null) {
            return <Notice type='error' text={ this.state.error.message } />;
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
                text='Back'
                buttonStyle='secondary'
                onClick={ this.handleToLogin }
                isEnabled={ !this.state.isSending }
                />
        );
    },

    render: function() {
        return (
            <div>
                <TopMenu
                    headerText='Koifly'
                    leftText='Back'
                    rightText='Sign Up'
                    onLeftClick={ this.handleToLogin }
                    onRightClick={ this.handleToSignup }
                    />

                <CompactContainer>
                <form>

                    { this.renderNotice() }
                    { this.renderError() }

                    <Section>

                        <SectionTitle>Log in without password</SectionTitle>

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
                                We will send you an email with a link, which will log in you into app
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

                    <SectionButton
                        text='Log In With Password'
                        onClick={ this.handleToLogin }
                        />
                </form>
                </CompactContainer>

                <BottomMenu isMobile={ true } />
            </div>
        );
    }
});


module.exports = OneTimeLogin;
