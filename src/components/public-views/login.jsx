import React from 'react';
import { bool } from 'prop-types';
import AppLink from '../common/app-link';
import Button from '../common/buttons/button';
import CompactContainer from '../common/compact-container';
import dataService from '../../services/data-service';
import DesktopBottomGrid from '../common/grids/desktop-bottom-grid';
import errorTypes from '../../errors/error-types';
import KoiflyError from '../../errors/error';
import MobileButton from '../common/buttons/mobile-button';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import Notice from '../common/notice/notice';
import PasswordInput from '../common/inputs/password-input';
import Section from '../common/section/section';
import SectionRow from '../common/section/section-row';
import SectionTitle from '../common/section/section-title';
import TextInput from '../common/inputs/text-input';
import Util from '../../utils/util';


export default class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      error: null,
      isInputInFocus: false,
      isSending: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(inputName, inputValue) {
    this.setState({ [inputName]: inputValue });
  }

  handleInputFocus() {
    this.setState({ isInputInFocus: true });
  }

  handleInputBlur() {
    this.setState({ isInputInFocus: false });
  }

  handleSubmit(event) {
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
        this.login();
      })
      .catch(error => {
        this.updateError(error);
      });
  }

  login() {
    if (!this.props.isStayOnThisPage) {
      navigationService.goToFlightLog();
    }
  }

  getValidationError() {
    if (Util.isEmptyString(this.state.email) || Util.isEmptyString(this.state.password)) {
      return new KoiflyError(errorTypes.VALIDATION_ERROR, 'All fields are required');
    }

    return null;
  }

  updateError(error) {
    this.setState({
      error: error,
      isSending: false
    });
  }

  renderMobileTopMenu() {
    return (
      <MobileTopMenu
        header='Koifly'
        leftButtonCaption='About'
        rightButtonCaption='Sign Up'
        onLeftClick={navigationService.goToHomePage}
        onRightClick={navigationService.goToSignup}
        isPositionFixed={!this.state.isInputInFocus}
      />
    );
  }

  renderError() {
    if (this.state.error) {
      return <Notice isPadded={true} type='error' text={this.state.error.message}/>;
    }
  }

  renderDesktopButtons() {
    return <DesktopBottomGrid leftElements={[ this.renderSendButton() ]}/>;
  }

  renderSendButton() {
    return (
      <Button
        caption={this.state.isSending ? 'Sending...' : 'Log in'}
        type='submit'
        buttonStyle='primary'
        onClick={this.handleSubmit}
        isEnabled={!this.state.isSending}
      />
    );
  }

  renderMobileButtons() {
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
          onClick={navigationService.goToResetPassword}
          isEnabled={!this.state.isSending}
        />

        <MobileButton
          caption='Log In Without Password'
          onClick={navigationService.goToOneTimeLogin}
          isEnabled={!this.state.isSending}
        />

        <MobileButton
          caption='Don&#39;t Have Account?'
          onClick={navigationService.goToSignup}
          isEnabled={!this.state.isSending}
        />
      </div>
    );
  }

  renderNavigationMenu() {
    return (
      <NavigationMenu
        isMobile={true}
        isPositionFixed={!this.state.isInputInFocus}
      />
    );
  }

  render() {
    return (
      <div data-testid='login'>
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
                <AppLink onClick={navigationService.goToResetPassword}>Forgot Password?</AppLink>
              </SectionRow>

              <SectionRow isDesktopOnly={true}>
                <AppLink onClick={navigationService.goToOneTimeLogin}>Log in without Password</AppLink>
              </SectionRow>

              <SectionRow isDesktopOnly={true} isLast={true}>
                <AppLink onClick={navigationService.goToSignup}>Sign up Now!</AppLink>
              </SectionRow>
            </Section>

            {this.renderMobileButtons()}
          </form>
        </CompactContainer>

        {this.renderNavigationMenu()}
      </div>
    );
  }
}


Login.defaultProps = {
  isStayOnThisPage: false
};

Login.propTypes = {
  isStayOnThisPage: bool
};
