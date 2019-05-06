'use strict';

var React = require('react');

var dataService = require('../../services/data-service');
var PublicViewMixin = require('../mixins/public-view-mixin');
var Util = require('../../utils/util');

var Button = require('../common/buttons/button');
var CompactContainer = require('../common/compact-container');
var DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var MobileButton = require('../common/buttons/mobile-button');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var Notice = require('../common/notice/notice');
var PasswordInput = require('../common/inputs/password-input');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');



var ResetPassword = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({ // url args
            pilotId: React.PropTypes.string.isRequired,
            authToken: React.PropTypes.string.isRequired
        })
    },

    mixins: [ PublicViewMixin ],

    getInitialState: function() {
        return {
            password: '',
            passwordConfirm: '',
            error: null,
            isSending: false,
            successNotice: false
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

        var password = this.state.password;
        var pilotId = this.props.params.pilotId;
        var authToken = this.props.params.authToken;
        dataService
            .resetPassword(password, pilotId, authToken)
            .then(() => this.setState({ successNotice: true }))
            .catch(error => this.updateError(error));
    },

    getValidationError: function() {
        if (Util.isEmptyString(this.state.password)) {
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'All fields are required');
        }

        if (this.state.password !== this.state.passwordConfirm) {
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'password and confirmed password must be the same');
        }

        return null;
    },

    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                header='Koifly'
                rightButtonCaption='Log in'
                onRightClick={ this.handleGoToLogin }
                isPositionFixed={ !this.state.isInputInFocus }
                />
        );
    },
    
    renderDesktopButtons: function() {
        return <DesktopBottomGrid leftElements={ [ this.renderSaveButton() ] } />;
    },

    renderSaveButton: function() {
        return (
            <Button
                caption={ this.state.isSending ? 'Saving...' : 'Save' }
                type='submit'
                buttonStyle='primary'
                onClick={ this.handleSubmit }
                isEnabled={ !this.state.isSending }
                />
        );
    },
    
    renderMobileButtons: function() {
        return (
            <MobileButton
                caption={ this.state.isSending ? 'Saving ...' : 'Save' }
                type='submit'
                buttonStyle='primary'
                onClick={ this.handleSubmit }
                isEnabled={ !this.state.isSending }
                />
        );
    },

    renderSuccessNotice: function() {
        return (
            <div>
                { this.renderMobileTopMenu() }
                { this.renderNavigationMenu() }
                <Notice
                    text='Your password was successfully reset'
                    type='success'
                    onClick={ this.handleGoToFlightLog }
                    buttonText='Go to App'
                    />
            </div>
        );
    },

    render: function() {
        if (this.state.successNotice) {
            return this.renderSuccessNotice();
        }

        return (
            <div>
                { this.renderMobileTopMenu() }
                { this.renderError() }

                <CompactContainer>
                    <form>
                        <Section>
    
                            <SectionTitle>Reset Password</SectionTitle>
    
                            <SectionRow>
                                <PasswordInput
                                    inputValue={ this.state.password }
                                    labelText='New Password:'
                                    inputName='password'
                                    onChange={ this.handleInputChange }
                                    onFocus={ this.handleInputFocus }
                                    onBlur={ this.handleInputBlur }
                                    />
                            </SectionRow>
    
                            <SectionRow isLast={ true }>
                                <PasswordInput
                                    inputValue={ this.state.passwordConfirm }
                                    labelText='Confirm password:'
                                    inputName='passwordConfirm'
                                    onChange={ this.handleInputChange }
                                    onFocus={ this.handleInputFocus }
                                    onBlur={ this.handleInputBlur }
                                    />
                            </SectionRow>
    
                            { this.renderDesktopButtons() }
                        </Section>
    
                        { this.renderMobileButtons() }
                    </form>
                </CompactContainer>

                { this.renderNavigationMenu() }
            </div>
        );
    }
});


module.exports = ResetPassword;
