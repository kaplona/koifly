'use strict';

const React = require('react');
const { shape, string } = React.PropTypes;
const Button = require('../common/buttons/button');
const CompactContainer = require('../common/compact-container');
const dataService = require('../../services/data-service');
const DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
const ErrorTypes = require('../../errors/error-types');
const KoiflyError = require('../../errors/error');
const MobileButton = require('../common/buttons/mobile-button');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const Notice = require('../common/notice/notice');
const PublicViewMixin = require('../mixins/public-view-mixin');
const PasswordInput = require('../common/inputs/password-input');
const Section = require('../common/section/section');
const SectionRow = require('../common/section/section-row');
const SectionTitle = require('../common/section/section-title');
const Util = require('../../utils/util');


const ResetPassword = React.createClass({

    propTypes: {
        params: shape({ // url args
            pilotId: string.isRequired,
            authToken: string.isRequired
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

        const validationError = this.getValidationError();
        if (validationError) {
            this.updateError(validationError);
            return;
        }
        
        // If no errors
        this.setState({
            isSending: true,
            error: null
        });

        const password = this.state.password;
        const pilotId = this.props.params.pilotId;
        const authToken = this.props.params.authToken;
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
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'Password and confirmed password must be the same');
        }

        return null;
    },

    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                header='Koifly'
                rightButtonCaption='Log in'
                onRightClick={this.handleGoToLogin}
                isPositionFixed={!this.state.isInputInFocus}
            />
        );
    },
    
    renderDesktopButtons: function() {
        return <DesktopBottomGrid leftElements={[ this.renderSaveButton() ]} />;
    },

    renderSaveButton: function() {
        return (
            <Button
                caption={this.state.isSending ? 'Saving...' : 'Save'}
                type='submit'
                buttonStyle='primary'
                onClick={this.handleSubmit}
                isEnabled={!this.state.isSending}
            />
        );
    },
    
    renderMobileButtons: function() {
        return (
            <MobileButton
                caption={this.state.isSending ? 'Saving ...' : 'Save'}
                type='submit'
                buttonStyle='primary'
                onClick={this.handleSubmit}
                isEnabled={!this.state.isSending}
            />
        );
    },

    renderSuccessNotice: function() {
        return (
            <div>
                {this.renderMobileTopMenu()}
                {this.renderNavigationMenu()}
                <Notice
                    text='Your password was successfully reset'
                    type='success'
                    onClick={this.handleGoToFlightLog}
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
                {this.renderMobileTopMenu()}
                {this.renderError()}

                <CompactContainer>
                    <form>
                        <Section>
    
                            <SectionTitle>Reset Password</SectionTitle>
    
                            <SectionRow>
                                <PasswordInput
                                    inputValue={this.state.password}
                                    labelText='New Password:'
                                    inputName='password'
                                    onChange={this.handleInputChange}
                                    onFocus={this.handleInputFocus}
                                    onBlur={this.handleInputBlur}
                                />
                            </SectionRow>
    
                            <SectionRow isLast={true}>
                                <PasswordInput
                                    inputValue={this.state.passwordConfirm}
                                    labelText='Confirm password:'
                                    inputName='passwordConfirm'
                                    onChange={this.handleInputChange}
                                    onFocus={this.handleInputFocus}
                                    onBlur={this.handleInputBlur}
                                />
                            </SectionRow>
    
                            {this.renderDesktopButtons()}
                        </Section>
    
                        {this.renderMobileButtons()}
                    </form>
                </CompactContainer>

                {this.renderNavigationMenu()}
            </div>
        );
    }
});


module.exports = ResetPassword;
