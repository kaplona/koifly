import React from 'react';
import AppLink from '../common/app-link';
import Button from '../common/buttons/button';
import CompactContainer from '../common/compact-container';
import DesktopBottomGrid from '../common/grids/desktop-bottom-grid';
import EmailVerificationNotice from '../common/notice/email-verification-notice';
import ErrorBox from '../common/notice/error-box';
import errorTypes from '../../errors/error-types';
import KoiflyError from '../../errors/error';
import MobileButton from '../common/buttons/mobile-button';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import Notice from '../common/notice/notice';
import PasswordInput from '../common/inputs/password-input';
import PilotModel from '../../models/pilot';
import Section from '../common/section/section';
import SectionRow from '../common/section/section-row';
import SectionTitle from '../common/section/section-title';
import Util from '../../utils/util';
import View from '../common/view';


export default class PilotChangePassword extends React.Component {
  constructor() {
    super();
    this.state = {
      password: '',
      newPassword: '',
      passwordConfirm: '',
      error: null,
      loadingError: null,
      isSaving: false,
      successNotice: false,
      isUserActivated: true,
      isInputInFocus: false
    };

    this.handleStoreModified = this.handleStoreModified.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    PilotModel.hideEmailVerificationNotice();
  }

  handleStoreModified() {
    const activationStatus = PilotModel.getUserActivationStatus();
    if (activationStatus && activationStatus.error) {
      this.setState({ loadingError: activationStatus.error });
      return;
    }
    this.setState({
      isUserActivated: activationStatus,
      loadingError: null
    });
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
      isSaving: true,
      error: null
    });

    PilotModel
      .changePassword(this.state.password, this.state.newPassword)
      .then(() => {
        this.setState({
          successNotice: true,
          isSaving: false
        });
      })
      .catch(error => this.updateError(error));
  }

  updateError(error) {
    this.setState({
      error: error,
      isSaving: false
    });
  }

  getValidationError() {
    if (Util.isEmptyString(this.state.password) || Util.isEmptyString(this.state.newPassword)) {
      return new KoiflyError(errorTypes.VALIDATION_ERROR, 'All fields are required');
    }

    if (this.state.newPassword !== this.state.passwordConfirm) {
      return new KoiflyError(errorTypes.VALIDATION_ERROR, 'New password and confirmed password must be the same');
    }

    return null;
  }

  isSaveButtonsEnabled() {
    return this.state.isUserActivated && !this.state.isSaving;
  }

  renderEmailVerificationNotice() {
    if (!this.state.isUserActivated) {
      const noticeText = [
        'You need to verify your email before changing your password.',
        'Follow the link we sent you.'
      ].join(' ');

      return <EmailVerificationNotice isPadded={true} text={noticeText} type='error'/>;
    }
  }

  renderMobileTopMenu() {
    return (
      <MobileTopMenu
        leftButtonCaption='Back'
        rightButtonCaption='Save'
        onLeftClick={navigationService.goToPilotView}
        onRightClick={this.handleSubmit}
        isPositionFixed={!this.state.isInputInFocus}
      />
    );
  }

  renderNavigationMenu() {
    return (
      <NavigationMenu
        currentView={PilotModel.getModelKey()}
        isPositionFixed={!this.state.isInputInFocus}
      />
    );
  }

  renderError() {
    if (this.state.error) {
      return <ErrorBox isPadded={true} error={this.state.error}/>;
    }
  }

  renderDesktopButtons() {
    return (
      <DesktopBottomGrid
        leftElements={[
          this.renderSaveButton(),
          this.renderCancelButton()
        ]}
      />
    );
  }

  renderSaveButton() {
    return (
      <Button
        caption={this.state.isSaving ? 'Saving...' : 'Save'}
        type='submit'
        buttonStyle='primary'
        onClick={this.handleSubmit}
        isEnabled={this.isSaveButtonsEnabled()}
      />
    );
  }

  renderCancelButton() {
    return (
      <Button
        caption='Cancel'
        buttonStyle='secondary'
        onClick={navigationService.goToPilotView}
        isEnabled={!this.state.isSaving}
      />
    );
  }

  renderMobileButtons() {
    return (
      <div>
        <MobileButton
          caption={this.state.isSaving ? 'Saving...' : 'Save'}
          type='submit'
          buttonStyle='primary'
          onClick={this.handleSubmit}
          isEnabled={this.isSaveButtonsEnabled()}
        />

        <MobileButton
          caption='Forgot Password?'
          onClick={navigationService.goToResetPassword}
        />
      </div>
    );
  }

  renderSuccessNotice() {
    return (
      <div>
        {this.renderMobileTopMenu()}
        {this.renderNavigationMenu()}
        <Notice text='Your password was successfully changed' type='success'/>
      </div>
    );
  }

  render() {
    if (this.state.successNotice) {
      return this.renderSuccessNotice();
    }

    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        {this.renderMobileTopMenu()}
        {this.renderEmailVerificationNotice()}
        {this.renderError()}

        <CompactContainer>
          <form>
            <Section>
              <SectionTitle>Change Password</SectionTitle>

              <SectionRow>
                <PasswordInput
                  inputValue={this.state.password}
                  labelText='Current Password:'
                  inputName='password'
                  onChange={this.handleInputChange}
                  onFocus={this.handleInputFocus}
                  onBlur={this.handleInputBlur}
                />
              </SectionRow>

              <SectionRow>
                <PasswordInput
                  inputValue={this.state.newPassword}
                  labelText='New Password:'
                  inputName='newPassword'
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

              <SectionRow isDesktopOnly={true} isLast={true}>
                <AppLink onClick={navigationService.goToResetPassword}>Forgot Password?</AppLink>
              </SectionRow>
            </Section>

            {this.renderMobileButtons()}
          </form>
        </CompactContainer>

        {this.renderNavigationMenu()}
      </View>
    );
  }
}
