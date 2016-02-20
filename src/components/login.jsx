'use strict';

var React = require('react');
var Router = require('react-router');
var History = Router.History;
var Link = Router.Link;
var DataService = require('../services/data-service');
var TopMenu = require('./common/menu/top-menu');
var BottomMenu = require('./common/menu/bottom-menu');
var BottomButtons = require('./common/buttons/bottom-buttons');
var Section = require('./common/section/section');
var SectionTitle = require('./common/section/section-title');
var SectionRow = require('./common/section/section-row');
var SectionButton = require('./common/buttons/section-button');
var TextInput = require('./common/inputs/text-input');
var PasswordInput = require('./common/inputs/password-input');
var Button = require('./common/buttons/button');
var Notice = require('./common/notice/notice');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


var Login = React.createClass({

    propTypes: {
        isStayOnThisPage: React.PropTypes.bool
    },

    mixins: [ History ],

    getInitialState: function() {
        return {
            email: null,
            password: null,
            error: null,
            isSending: false
        };
    },

    handleSubmit: function(event) {
        if (event) {
            event.preventDefault();
        }

        var validationResponse = this.validateForm();
        if (validationResponse !== true) {
            return this.handleError(validationResponse);
        }

        this.setState({
            isSending: true,
            error: null
        });

        var pilotCredentials = {
            email: this.state.email,
            password: this.state.password
        };
        DataService.loginPilot(pilotCredentials).then(() => {
            this.handleLogin();
        }).catch((error) => {
            // DEV
            setTimeout(() => this.handleError(error), 2000);
        });
    },

    handleLogin: function() {
        if (!this.props.isStayOnThisPage) {
            this.history.pushState(null, '/flights');
        }
    },

    handleLinkTo: function(link) {
        this.history.pushState(null, link);
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

    validateForm: function() {
        if (this.state.email === null || this.state.email.trim() === '' ||
            this.state.password === null || this.state.password.trim() === ''
        ) {
            return new KoiflyError(ErrorTypes.VALIDATION_FAILURE, 'All fields are required');
        }

        return true;
    },

    renderError: function() {
        if (this.state.error !== null) {
            return <Notice type='validation' text={ this.state.error.message } />;
        }
    },

    renderSendButton: function() {
        return (
            <Button
                text={ this.state.isSending ? 'Sending...' : 'Log in' }
                type='submit'
                buttonStyle='primary'
                onClick={ this.handleSubmit }
                isEnabled={ !this.state.isSending }
                />
        );
    },

    render: function() {
        return (
            <div>
                <TopMenu
                    headerText='Koifly'
                    leftText='About'
                    rightText='Sign Up'
                    onLeftClick={ () => this.handleLinkTo('/') }
                    onRightClick={ () => this.handleLinkTo('/signup') }
                    />

                <form>

                    <Section isCompact={ true }>
                        { this.renderError() }

                        <SectionTitle>Please, log in</SectionTitle>

                        <SectionRow>
                            <TextInput
                                inputValue={ this.state.email }
                                labelText='Email:'
                                inputName='email'
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <SectionRow isLast={ true }>
                            <PasswordInput
                                inputValue={ this.state.password }
                                labelText='Password:'
                                inputName='password'
                                onChange={ this.handleInputChange }
                                />
                        </SectionRow>

                        <BottomButtons leftElements={ [ this.renderSendButton() ] } />

                        <SectionRow isDesktopOnly={ true } >
                            <Link to='/reset-pass'>Forgot Password?</Link>
                        </SectionRow>

                        <SectionRow isDesktopOnly={ true } >
                            <Link to='/one-time-login'>Log In Without Password</Link>
                        </SectionRow>

                        <SectionRow isDesktopOnly={ true } isLast={ true } >
                            <Link to='/signup'>Sign up now!</Link>
                        </SectionRow>
                    </Section>

                    <SectionButton
                        text={ this.state.isSending ? 'Sending...' : 'Log in' }
                        type='submit'
                        buttonStyle='primary'
                        onClick={ this.handleSubmit }
                        isEnabled={ !this.state.isSending }
                        />

                    <SectionButton
                        text='Forgot Password?'
                        onClick={ () => this.handleLinkTo('/reset-pass') }
                        />

                    <SectionButton
                        text='Log In Without Password'
                        onClick={ () => this.handleLinkTo('/one-time-login') }
                        />

                    <SectionButton
                        text='Don&#39;t Have Account?'
                        onClick={ () => this.handleLinkTo('/signup') }
                        />
                </form>

                <BottomMenu isMobile={ true } />
            </div>
        );
    }
});


module.exports = Login;
