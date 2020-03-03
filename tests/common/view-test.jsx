/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import dataServiceConstants from '../../src/constants/data-service-constants';
import errorTypes from '../../src/errors/error-types';
import PilotModel from '../../src/models/pilot';
import PubSub from '../../src/utils/pubsub';

import View from '../../src/components/common/view';


describe('View component.', () => {
  let element;
  let handleStoreModified;

  const mocks = {
    childText: 'test child text',
    childClassName: 'testChild',
    authError: { type: errorTypes.AUTHENTICATION_ERROR },
    notAuthError: { type: 'notAuthError' }
  };

  before(() => {
    Sinon.stub(window, 'scrollTo');
  });

  after(() => {
    window.scrollTo.restore();
  });

  beforeEach(() => {
    handleStoreModified = Sinon.spy();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Defaults testing.', () => {
    beforeEach(() => {
      Sinon
        .stub(PilotModel, 'getEmailVerificationNoticeStatus')
        .onFirstCall().returns(false)
        .onSecondCall().returns(true);

      element = (
        <View error={mocks.notAuthError} onStoreModified={handleStoreModified}>
          {mocks.childText}
        </View>
      );
    });

    afterEach(() => {
      PilotModel.getEmailVerificationNoticeStatus.restore();
    });

    it('sets default state and renders only parsed children', () => {
      const { getByText, queryByTestId, queryAllByTestId } = render(element);
      const ChildrenContent = getByText(mocks.childText);
      const loginForm = queryByTestId('login');
      const notices = queryAllByTestId('notice');

      expect(ChildrenContent).to.be.ok;
      expect(loginForm).to.not.be.ok;
      expect(notices).to.have.lengthOf(0);
    });

    it('requests for store data once component was mounted', () => {
      render(element);

      expect(handleStoreModified).to.have.been.calledOnce;
    });

    it('requests for store data again when store-was-modified event emitted', () => {
      render(element);

      expect(handleStoreModified).to.have.been.calledOnce;
      PubSub.emit(dataServiceConstants.STORE_MODIFIED_EVENT);
      expect(handleStoreModified).to.have.been.calledTwice;
    });

    it('renders email not verified notice with proper props', () => {
      const { getByText } = render(element);

      // component called PilotModel.getActivationNoticeStatus which returned true on second call
      PubSub.emit(dataServiceConstants.STORE_MODIFIED_EVENT);
      const notice = getByText('We sent you an email with a verification link.', { exact: false });

      expect(notice).to.be.ok;
    });

    it('close email-not-verified notice when close button clicked', () => {
      const handleHideNotice = Sinon.stub(PilotModel, 'hideEmailVerificationNotice');
      const { getByText, queryByText } = render(element);

      // component called PilotModel.getActivationNoticeStatus which returned true on second call
      PubSub.emit(dataServiceConstants.STORE_MODIFIED_EVENT);

      const closeButton = getByText('x');
      fireEvent.click(closeButton);

      const notice = queryByText('We sent you an email with a verification link.', { exact: false });

      expect(notice).to.not.be.ok;
      expect(handleHideNotice).to.have.been.calledOnce;

      PilotModel.hideEmailVerificationNotice.restore();
    });
  });


  describe('Authentication error testing', () => {
    beforeEach(() => {
      Sinon.stub(PilotModel, 'getEmailVerificationNoticeStatus');

      element = (
        <View error={mocks.authError} onStoreModified={handleStoreModified}>
          <div className={mocks.childClassName}>{mocks.childText}</div>
        </View>
      );
    });

    afterEach(() => {
      PilotModel.getEmailVerificationNoticeStatus.restore();
    });

    it('renders login form instead of parsed children', () => {
      const { queryByText, getByTestId } = render(element);
      const loginForm = getByTestId('login');
      const ChildrenContent = queryByText(mocks.childText);

      expect(loginForm).to.be.ok;
      expect(ChildrenContent).to.not.be.ok;
    });
  });
});
