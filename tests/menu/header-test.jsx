/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import dataServiceConstants from '../../src/constants/data-service-constants';
import navigationService from '../../src/services/navigation-service';
import PilotModel from '../../src/models/pilot';
import PubSub from '../../src/utils/pubsub';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import Header from '../../src/components/common/menu/header';


describe('Header component', () => {
  const defaults = {
    loginText: 'Log In',
    logoutText: 'Log Out'
  };

  afterEach(() => {
    cleanup();
  });


  beforeEach(() => {
    Sinon.stub(PilotModel, 'logout').returns(Promise.resolve());
    Sinon.stub(navigationService, 'goToLogin');
  });

  afterEach(() => {
    PilotModel.logout.restore();
    PilotModel.isLoggedIn.restore();
    navigationService.goToLogin.restore();
  });

  it('renders log in link when Pilot is not logged in', () => {
    Sinon.stub(PilotModel, 'isLoggedIn').returns(false);

    const { getByText } = render(<Header/>);
    const login = getByText(defaults.loginText);

    expect(login).to.be.ok;

    fireEvent.click(login);

    expect(navigationService.goToLogin).to.have.been.calledOnce;
  });

  it('changes log in to log out when storeModified event emitted', () => {
    Sinon
      .stub(PilotModel, 'isLoggedIn')
      .returns(true)
      .onFirstCall().returns(false);

    const { queryByText } = render(<Header/>);
    let login = queryByText(defaults.loginText);
    let logout = queryByText(defaults.logoutText);

    expect(login).to.be.ok;
    expect(logout).to.not.be.ok;

    PubSub.emit(dataServiceConstants.STORE_MODIFIED_EVENT);

    login = queryByText(defaults.loginText);
    logout = queryByText(defaults.logoutText);

    expect(login).to.not.be.ok;
    expect(logout).to.be.ok;
  });

  it('renders log out link when pilot logged in', () => {
    Sinon.stub(PilotModel, 'isLoggedIn').returns(true);
    const { getByText } = render(<Header/>);
    const logout = getByText(defaults.logoutText);
    fireEvent.click(logout);

    expect(PilotModel.logout).to.have.been.calledOnce;
  });
});
