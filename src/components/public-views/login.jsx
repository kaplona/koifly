'use strict';

var React = require('react');
var Router = require('react-router');
var History = Router.History;
var Link = Router.Link;

var DataService = require('../../services/data-service');

var Button = require('../common/buttons/button');
var CompactContainer = require('../common/compact-container');
var DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var MobileButton = require('../common/buttons/mobile-button');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var Notice = require('../common/notice/notice');
var PasswordInput = require('../common/inputs/password-input');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var TextInput = require('../common/inputs/text-input');


var Login = React.createClass({

    propTypes: {
        isStayOnThisPage: React.PropTypes.bool.isRequired
    },

    getDefaultProps: function() {
        return {
            isStayOnThisPage: false
        };
    },

    mixins: [ History ],

    getInitialState: function() {
        return {
            email: '',
            password: '',
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
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'All fields are required');
        }

        return true;
    },

    renderError: function() {
        if (this.state.error !== null) {
            return <Notice type='error' text={ this.state.error.message } />;
        }
    },

    renderSendButton: function() {
        return (
            <Button
                caption={ this.state.isSending ? 'Sending...' : 'Log in' }
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
                <MobileTopMenu
                    header='Koifly'
                    leftButtonCaption='About'
                    rightButtonCaption='Sign Up'
                    onLeftClick={ () => this.handleLinkTo('/') }
                    onRightClick={ () => this.handleLinkTo('/signup') }
                    />
                <NavigationMenu isMobile={ true } />

                <CompactContainer>
                <form>
                    { this.renderError() }

                    <Section>
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

                        <DesktopBottomGrid leftElements={ [ this.renderSendButton() ] } />

                        <SectionRow isDesktopOnly={ true } >
                            <Link to='/reset-password'>Forgot Password?</Link>
                        </SectionRow>

                        <SectionRow isDesktopOnly={ true } >
                            <Link to='/one-time-login'>Log In Without Password</Link>
                        </SectionRow>

                        <SectionRow isDesktopOnly={ true } isLast={ true } >
                            <Link to='/signup'>Sign up now!</Link>
                        </SectionRow>
                    </Section>

                    <MobileButton
                        caption={ this.state.isSending ? 'Sending...' : 'Log in' }
                        type='submit'
                        buttonStyle='primary'
                        onClick={ this.handleSubmit }
                        isEnabled={ !this.state.isSending }
                        />

                    <MobileButton
                        caption='Forgot Password?'
                        onClick={ () => this.handleLinkTo('/reset-password') }
                        />

                    <MobileButton
                        caption='Log In Without Password'
                        onClick={ () => this.handleLinkTo('/one-time-login') }
                        />

                    <MobileButton
                        caption='Don&#39;t Have Account?'
                        onClick={ () => this.handleLinkTo('/signup') }
                        />
                </form>
                </CompactContainer>
            </div>
        );
    }
});


module.exports = Login;
