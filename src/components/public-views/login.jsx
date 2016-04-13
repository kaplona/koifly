'use strict';

var React = require('react');

var dataService = require('../../services/data-service');
var PublicViewMixin = require('../mixins/public-view-mixin');
var Util = require('../../utils/util');

var AppLink = require('../common/app-link');
var Button = require('../common/buttons/button');
var CompactContainer = require('../common/compact-container');
var DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var MobileButton = require('../common/buttons/mobile-button');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var PasswordInput = require('../common/inputs/password-input');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var TextInput = require('../common/inputs/text-input');



var { bool } = React.PropTypes;

var Login = React.createClass({

    propTypes: {
        isStayOnThisPage: bool.isRequired
    },

    getDefaultProps: function() {
        return {
            isStayOnThisPage: false
        };
    },

    mixins: [ PublicViewMixin ],

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

        var validationError = this.getValidationError();
        if (validationError) {
            this.updateError(validationError);
            return;
        }

        // If no errors
        this.setState({
            isSending: true,
            error: null
        });

        var pilotCredentials = {
            email: this.state.email,
            password: this.state.password
        };

        dataService
            .loginPilot(pilotCredentials)
            .then(() => {
                this.handleLogin();
            })
            .catch((error) => {
                this.updateError(error);
            });
    },

    handleLogin: function() {
        if (!this.props.isStayOnThisPage) {
            this.handleGoToFlightLog();
        }
    },

    getValidationError: function() {
        if (Util.isEmptyString(this.state.email) || Util.isEmptyString(this.state.password)) {
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'All fields are required');
        }

        return null;
    },
    
    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                header='Koifly'
                leftButtonCaption='About'
                rightButtonCaption='Sign Up'
                onLeftClick={ this.handleGoToHomePage }
                onRightClick={ this.handleGoToSignup }
                />
        );
    },
    
    renderDesktopButtons: function() {
        return <DesktopBottomGrid leftElements={ [ this.renderSendButton() ] } />;
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
    
    renderMobileButtons: function() {
        return (
            <div>
                <MobileButton
                    caption={ this.state.isSending ? 'Sending...' : 'Log in' }
                    type='submit'
                    buttonStyle='primary'
                    onClick={ this.handleSubmit }
                    isEnabled={ !this.state.isSending }
                    />

                <MobileButton
                    caption='Forgot Password?'
                    onClick={ this.handleGoToResetPassword }
                    />

                <MobileButton
                    caption='Log In Without Password'
                    onClick={ this.handleGoToOneTimeLogin }
                    />

                <MobileButton
                    caption='Don&#39;t Have Account?'
                    onClick={ this.handleGoToSignup }
                    />
            </div>
        );
    },

    render: function() {
        return (
            <div>
                { this.renderMobileTopMenu() }
                { this.renderNavigationMenu() }

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
    
                            { this.renderDesktopButtons() }
    
                            <SectionRow isDesktopOnly={ true } >
                                <AppLink onClick={ this.handleGoToResetPassword }>Forgot Password?</AppLink>
                            </SectionRow>
    
                            <SectionRow isDesktopOnly={ true } >
                                <AppLink onClick={ this.handleGoToOneTimeLogin }>Log In Without Password</AppLink>
                            </SectionRow>
    
                            <SectionRow isDesktopOnly={ true } isLast={ true } >
                                <AppLink onClick={ this.handleGoToSignup }>Sign up now!</AppLink>
                            </SectionRow>
                        </Section>
    
                        { this.renderMobileButtons() }
                    </form>
                </CompactContainer>
            </div>
        );
    }
});


module.exports = Login;
