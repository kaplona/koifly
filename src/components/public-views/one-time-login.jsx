'use strict';

const React = require('react');
const Button = require('../common/buttons/button');
const CompactContainer = require('../common/compact-container');
const dataService = require('../../services/data-service');
const Description = require('../common/section/description');
const DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
const ErrorTypes = require('../../errors/error-types');
const KoiflyError = require('../../errors/error');
const MobileButton = require('../common/buttons/mobile-button');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const Notice = require('../common/notice/notice');
const PublicViewMixin = require('../mixins/public-view-mixin');
const Section = require('../common/section/section');
const SectionRow = require('../common/section/section-row');
const SectionTitle = require('../common/section/section-title');
const TextInput = require('../common/inputs/text-input');
const Util = require('../../utils/util');


const OneTimeLogin = React.createClass({

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

    if (Util.isEmptyString(this.state.email)) {
      this.updateError(new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'Enter your email address'));
      return;
    }

    this.setState({
      isSending: true,
      error: null
    });

    const emailAddress = this.state.email;
    dataService
      .sendOneTimeLoginEmail(emailAddress)
      .then(() => {
        this.setState({
          isSending: false,
          lastSentEmailAddress: emailAddress
        });
      })
      .catch(error => {
        this.updateError(error);
      });
  },

  renderMobileTopMenu: function() {
    return (
      <MobileTopMenu
        header='Koifly'
        leftButtonCaption='Back'
        rightButtonCaption='Sign Up'
        onLeftClick={this.handleGoToLogin}
        onRightClick={this.handleGoToSignup}
        isPositionFixed={!this.state.isInputInFocus}
      />
    );
  },

  renderNotice: function() {
    if (this.state.lastSentEmailAddress) {
      const noticeText = 'One-time-login link was successfully sent to ' + this.state.lastSentEmailAddress;
      return <Notice isPadded={true} text={noticeText}/>;
    }
  },

  renderDesktopButtons: function() {
    return (
      <DesktopBottomGrid
        leftElements={[
          this.renderSendButton(),
          this.renderCancelButton()
        ]}
      />
    );
  },

  renderSendButton: function() {
    return (
      <Button
        caption={this.state.isSending ? 'Sending...' : 'Send'}
        type='submit'
        buttonStyle='primary'
        onClick={this.handleSubmit}
        isEnabled={!this.state.isSending}
      />
    );
  },

  renderCancelButton: function() {
    return (
      <Button
        caption='Back'
        buttonStyle='secondary'
        onClick={this.handleGoToLogin}
        isEnabled={!this.state.isSending}
      />
    );
  },

  renderMobileButtons: function() {
    return (
      <div>
        <MobileButton
          caption={this.state.isSending ? 'Sending...' : 'Send'}
          type='submit'
          buttonStyle='primary'
          onClick={this.handleSubmit}
          isEnabled={!this.state.isSending}
        />

        <MobileButton
          caption='Log in with Password'
          onClick={this.handleGoToLogin}
        />
      </div>
    );
  },

  render: function() {
    return (
      <div>
        {this.renderMobileTopMenu()}
        {this.renderNotice()}
        {this.renderError()}

        <CompactContainer>
          <form>
            <Section>

              <SectionTitle>Log in without password</SectionTitle>

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
                <Description>
                  We will send you an email with a one-time-login link which you can use to login without a password
                </Description>
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


module.exports = OneTimeLogin;
