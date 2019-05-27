'use strict';

import React from 'react';
import { shape, string } from 'prop-types';
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
import Util from '../../utils/util';


export default class ResetPassword extends React.Component {
  constructor() {
    super();
    this.state = {
      password: '',
      passwordConfirm: '',
      error: null,
      isInputInFocus: false,
      isSending: false,
      successNotice: false
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

    const password = this.state.password;
    const pilotId = this.props.params.pilotId;
    const authToken = this.props.params.authToken;
    dataService
      .resetPassword(password, pilotId, authToken)
      .then(() => this.setState({ successNotice: true }))
      .catch(error => this.updateError(error));
  }

  getValidationError() {
    if (Util.isEmptyString(this.state.password)) {
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
        rightButtonCaption='Log in'
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
    return <DesktopBottomGrid leftElements={[ this.renderSaveButton() ]}/>;
  }

  renderSaveButton() {
    return (
      <Button
        caption={this.state.isSending ? 'Saving...' : 'Save'}
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
        caption={this.state.isSending ? 'Saving ...' : 'Save'}
        type='submit'
        buttonStyle='primary'
        onClick={this.handleSubmit}
        isEnabled={!this.state.isSending}
      />
    );
  }

  renderSuccessNotice() {
    return (
      <div>
        {this.renderMobileTopMenu()}
        {this.renderNavigationMenu()}
        <Notice
          text='Your password was successfully reset'
          type='success'
          onClick={navigationService.goToFlightLog}
          buttonText='Go to App'
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
}


ResetPassword.propTypes = {
  params: shape({ // url args
    pilotId: string.isRequired,
    authToken: string.isRequired,
  })
};
