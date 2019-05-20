'use strict';

const React = require('react');
const { bool } = React.PropTypes;
const AppLink = require('../common/app-link');
const Button = require('../common/buttons/button');
const CompactContainer = require('../common/compact-container');
const dataService = require('../../services/data-service');
const DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
const ErrorTypes = require('../../errors/error-types');
const KoiflyError = require('../../errors/error');
const MobileButton = require('../common/buttons/mobile-button');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const PasswordInput = require('../common/inputs/password-input');
const PublicViewMixin = require('../mixins/public-view-mixin');
const Section = require('../common/section/section');
const SectionRow = require('../common/section/section-row');
const SectionTitle = require('../common/section/section-title');
const TextInput = require('../common/inputs/text-input');
const Util = require('../../utils/util');


const Login = React.createClass({

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

    const pilotCredentials = {
      email: this.state.email,
      password: this.state.password
    };

    dataService
      .loginPilot(pilotCredentials)
      .then(() => {
        this.handleLogin();
      })
      .catch(error => {
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
        onLeftClick={this.handleGoToHomePage}
        onRightClick={this.handleGoToSignup}
        isPositionFixed={!this.state.isInputInFocus}
      />
    );
  },

  renderDesktopButtons: function() {
    return <DesktopBottomGrid leftElements={[ this.renderSendButton() ]}/>;
  },

  renderSendButton: function() {
    return (
      <Button
        caption={this.state.isSending ? 'Sending...' : 'Log in'}
        type='submit'
        buttonStyle='primary'
        onClick={this.handleSubmit}
        isEnabled={!this.state.isSending}
      />
    );
  },

  renderMobileButtons: function() {
    return (
      <div>
        <MobileButton
          caption={this.state.isSending ? 'Sending...' : 'Log in'}
          type='submit'
          buttonStyle='primary'
          onClick={this.handleSubmit}
          isEnabled={!this.state.isSending}
        />

        <MobileButton
          caption='Forgot Password?'
          onClick={this.handleGoToResetPassword}
          isEnabled={!this.state.isSending}
        />

        <MobileButton
          caption='Log In Without Password'
          onClick={this.handleGoToOneTimeLogin}
          isEnabled={!this.state.isSending}
        />

        <MobileButton
          caption='Don&#39;t Have Account?'
          onClick={this.handleGoToSignup}
          isEnabled={!this.state.isSending}
        />
      </div>
    );
  },

  render: function() {
    return (
      <div>
        {this.renderMobileTopMenu()}
        {this.renderError()}

        <CompactContainer>
          <form>
            <Section>
              <SectionTitle>Please, log in</SectionTitle>

              <SectionRow>
                <TextInput
                  inputValue={this.state.email}
                  labelText='Email:'
                  inputName='email'
                  isEmail={true}
                  onChange={this.handleInputChange}
                  onFocus={this.handleInputFocus}
                  onBlur={this.handleInputBlur}
                />
              </SectionRow>

              <SectionRow isLast={true}>
                <PasswordInput
                  inputValue={this.state.password}
                  labelText='Password:'
                  inputName='password'
                  onChange={this.handleInputChange}
                  onFocus={this.handleInputFocus}
                  onBlur={this.handleInputBlur}
                />
              </SectionRow>

              {this.renderDesktopButtons()}

              <SectionRow isDesktopOnly={true}>
                <AppLink onClick={this.handleGoToResetPassword}>Forgot Password?</AppLink>
              </SectionRow>

              <SectionRow isDesktopOnly={true}>
                <AppLink onClick={this.handleGoToOneTimeLogin}>Log in without Password</AppLink>
              </SectionRow>

              <SectionRow isDesktopOnly={true} isLast={true}>
                <AppLink onClick={this.handleGoToSignup}>Sign up Now!</AppLink>
              </SectionRow>
            </Section>

            {this.renderMobileButtons()}
          </form>
        </CompactContainer>

        {this.renderNavigationMenu()}
      </div>
    );
  }
});


module.exports = Login;
