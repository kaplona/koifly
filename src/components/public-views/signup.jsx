import React from 'react';
import AppLink from '../common/app-link';
import Button from '../common/buttons/button';
import CompactContainer from '../common/compact-container';
import dataService from '../../services/data-service';
import Description from '../common/section/description';
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


export default class Signup extends React.Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      passwordConfirm: '',
      isSubscribed: false,
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

  handleCheckboxChange() {
    this.setState({ isSubscribed: !this.state.isSubscribed });
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
      password: this.state.password,
      isSubscribed: this.state.isSubscribed
    };

    dataService
      .createPilot(pilotCredentials)
      .then(() => navigationService.goToPilotView())
      .catch(error => this.updateError(error));
  }

  getValidationError() {
    if (Util.isEmptyString(this.state.email) || Util.isEmptyString(this.state.password)) {
      return new KoiflyError(errorTypes.VALIDATION_ERROR, 'All fields are required');
    }

    if (this.state.password !== this.state.passwordConfirm) {
      return new KoiflyError(errorTypes.VALIDATION_ERROR, 'Password and confirmed password must be the same');
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
        rightButtonCaption='Log In'
        onRightClick={navigationService.goToLogin}
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
        caption={this.state.isSending ? 'Sending...' : 'Sign up'}
        type='submit'
        buttonStyle='primary'
        onClick={this.handleSubmit}
        isEnabled={!this.state.isSending}
      />
    );
  }

  renderMobileButtons() {
    return (
      <MobileButton
        caption={this.state.isSending ? 'Saving...' : 'Sign Up'}
        type='submit'
        buttonStyle='primary'
        onClick={this.handleSubmit}
        isEnabled={!this.state.isSending}
      />
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
      <div>
        {this.renderMobileTopMenu()}
        {this.renderError()}

        <CompactContainer>
          <form>
            <Section>

              <SectionTitle>Sign up</SectionTitle>

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
                <Description>
                  Your email will be used only for authorisation and won't be seen by anyone else
                </Description>
              </SectionRow>

              <SectionRow>
                <PasswordInput
                  inputValue={this.state.password}
                  labelText='Password:'
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

              <SectionRow isLast={true}>
                <Description>
                  <input
                    id='isSubscribed'
                    type='checkbox'
                    checked={this.state.isSubscribed}
                    onChange={this.handleCheckboxChange}
                  />
                  <label htmlFor='isSubscribed'>
                    Yes, let me know once new features will be added
                  </label>
                </Description>
              </SectionRow>

              {this.renderDesktopButtons()}

              <SectionRow isDesktopOnly={true} isLast={true}>
                <AppLink onClick={navigationService.goToLogin}>Have an Account? Log in now!</AppLink>
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
