'use strict';

var React = require('react');

var dataService = require('../../services/data-service');
var PublicViewMixin = require('../mixins/public-view-mixin');

var Button = require('../common/buttons/button');
var CompactContainer = require('../common/compact-container');
var Description = require('../common/section/description');
var DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var MobileButton = require('../common/buttons/mobile-button');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var Notice = require('../common/notice/notice');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var TextInput = require('../common/inputs/text-input');



var OneTimeLogin = React.createClass({

    mixins: [ PublicViewMixin ],

    getInitialState: function() {
        return {
            email: '',
            error: null,
            isSending: false,
            lastSentEmailAddress: null
        };
    },

    handleSubmit: function(event) {
        if (event) {
            event.preventDefault();
        }

        if (!this.state.email || this.state.email.trim() === '') {
            return this.updateError(new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'Enter your email address'));
        }

        this.setState({
            isSending: true,
            error: null
        });

        var emailAddress = this.state.email;
        dataService
            .sendOneTimeLoginEmail(emailAddress)
            .then(() => {
                this.setState({
                    isSending: false,
                    lastSentEmailAddress: emailAddress
                });
            })
            .catch((error) => {
                this.updateError(error);
            });
    },

    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                header='Koifly'
                leftButtonCaption='Back'
                rightButtonCaption='Sign Up'
                onLeftClick={ this.handleToLogin }
                onRightClick={ this.handleToSignup }
                />
        );
    },

    renderNotice: function() {
        if (this.state.lastSentEmailAddress) {
            var noticeText = 'Email with verification link was successfully sent to ' + this.state.lastSentEmailAddress;
            return <Notice text={ noticeText } />;
        }
    },
    
    renderDesktopButtons: function() {
        return (
            <DesktopBottomGrid
                leftElements={ [
                    this.renderSendButton(),
                    this.renderCancelButton()
                ] }
                />
        );
    },

    renderSendButton: function() {
        return (
            <Button
                caption={ this.state.isSending ? 'Sending...' : 'Send' }
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
                caption='Back'
                buttonStyle='secondary'
                onClick={ this.handleToLogin }
                isEnabled={ !this.state.isSending }
                />
        );
    },
    
    renderMobileButtons: function() {
        return (
            <div>
                <MobileButton
                    caption={ this.state.isSending ? 'Sending...' : 'Send' }
                    type='submit'
                    buttonStyle='primary'
                    onClick={ this.handleSubmit }
                    isEnabled={ !this.state.isSending }
                    />

                <MobileButton
                    caption='Log In With Password'
                    onClick={ this.handleToLogin }
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
    
                            { this.renderDesktopButtons() }
                        </Section>
    
                        { this.renderMobileButtons() }
                    </form>
                </CompactContainer>
            </div>
        );
    }
});


module.exports = OneTimeLogin;
