/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render, wait } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import dataService from '../../src/services/data-service';
import PilotModel from '../../src/models/pilot';
import EmailVerificationNotice from '../../src/components/common/notice/email-verification-notice';


describe('EmailVerificationNotice component', () => {
  let element;
  let handleClose;

  const defaults = {
    successNoticeText: 'The verification link was sent to your email',
    buttonText: 'Send email again',
    buttonSendingText: 'Sending...',
    successType: 'success'
  };

  const mocks = {
    noticeText: 'test text',
    noticeType: 'error',
    email: 'testEmail@test.com'
  };

  before(() => {
    Sinon.stub(window, 'scrollTo');
  });

  after(() => {
    window.scrollTo.restore();
  });

  beforeEach(() => {
    handleClose = Sinon.spy();
  });

  afterEach(() => {
    cleanup();
  });


  describe('Defaults testing', () => {
    beforeEach(() => {
      Sinon.stub(dataService, 'sendVerificationEmail').returns(Promise.resolve());
      Sinon.stub(PilotModel, 'getEmailAddress').returns(mocks.email);

      element = (
        <EmailVerificationNotice
          text={mocks.noticeText}
          type={mocks.noticeType}
          onClose={handleClose}
        />
      );
    });

    afterEach(() => {
      dataService.sendVerificationEmail.restore();
      PilotModel.getEmailAddress.restore();
    });

    it('displays passed text', () => {
      const { getByText } = render(element);
      const notice = getByText(mocks.noticeText);

      expect(notice).to.be.ok;
    });

    it('sets notification styles based on type', () => {
      const { container } = render(element);
      const notice = container.querySelectorAll(`x-${mocks.noticeType}`);

      expect(notice).to.be.ok;
    });

    it('can be closed', () => {
      const { getByText } = render(element);
      const closeButton = getByText('x');
      fireEvent.click(closeButton);

      expect(handleClose).to.have.been.calledOnce;
    });

    it('changes state to success when email is sent', async () => {
      const { getByText } = render(element);
      const button = getByText('Send email again');
      fireEvent.click(button);

      expect(button.value).to.equal('Sending...');
      expect(dataService.sendVerificationEmail).to.have.been.calledOnce;

      await wait(() => getByText(defaults.successNoticeText, { exact: false }));
      const notice = getByText(defaults.successNoticeText, { exact: false });

      expect(notice).to.be.ok;
      expect(notice.className).to.contain(`x-${defaults.successType}`);
    });
  });
});
