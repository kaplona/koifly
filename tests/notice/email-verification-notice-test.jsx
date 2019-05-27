'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;
const then = require('../../src/utils/then');
const expect = require('chai').expect;
const Sinon = require('sinon');
const dataService = require('../../src/services/data-service');
const PilotModel = require('../../src/models/pilot');

const EmailVerificationNotice = require('../../src/components/common/notice/email-verification-notice');
const Notice = require('../../src/components/common/notice/notice');


describe('EmailVerificationNotice component', () => {

  let component;

  const defaults = {
    successNoticeText: 'The verification link was sent to your email',
    buttonText: 'Send email again',
    buttonSendingText: 'Sending...',
    successType: 'success'
  };

  const mocks = {
    noticeText: 'test text',
    noticeType: 'test type',
    email: 'testEmail@test.com',
    handleClose: () => {
    }
  };


  describe('Defaults testing', () => {
    before(() => {
      Sinon.stub(dataService, 'sendVerificationEmail', () => {
        return Promise.resolve();
      });

      Sinon.stub(PilotModel, 'getEmailAddress', () => {
        return mocks.email;
      });

      component = TestUtils.renderIntoDocument(
        <EmailVerificationNotice
          text={mocks.noticeText}
          type={mocks.noticeType}
          onClose={mocks.handleClose}
        />
      );
    });

    after(() => {
      dataService.sendVerificationEmail.restore();
      PilotModel.getEmailAddress.restore();
    });

    it('sets default state and renders notice with proper props', () => {
      const notice = TestUtils.findRenderedComponentWithType(component, Notice);

      expect(component).to.have.deep.property('state.isEmailSent', false);
      expect(component).to.have.deep.property('state.isSending', false);
      expect(notice).to.have.deep.property('props.text', mocks.noticeText);
      expect(notice).to.have.deep.property('props.type', mocks.noticeType);
      expect(notice).to.have.deep.property('props.buttonText', defaults.buttonText);
      expect(notice).to.have.deep.property('props.isButtonEnabled', true);
      expect(notice).to.have.deep.property('props.onClose', mocks.handleClose);
    });

    it('changes state and view once send-email button clicked', done => {
      const button = ReactDOM.findDOMNode(component).querySelector('input');

      Simulate.click(button);

      then(() => {
        const notice = TestUtils.findRenderedComponentWithType(component, Notice);

        expect(component).to.have.deep.property('state.isEmailSent', true);
        expect(component).to.have.deep.property('state.isSending', true);
        expect(notice)
          .to.have.deep.property('props.text')
          .that.contain(defaults.successNoticeText)
          .and.contain(mocks.email);
        expect(notice).to.have.deep.property('props.type', defaults.successType);
        expect(notice).to.have.deep.property('props.buttonText', defaults.buttonSendingText);
        expect(notice).to.have.deep.property('props.isButtonEnabled', false);
        expect(notice).to.have.deep.property('props.onClick', null);
        expect(notice).to.have.deep.property('props.onClose', mocks.handleClose);

        done();
      });
    });
  });
});
