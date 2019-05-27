/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;
const PubSub = require('../../src/utils/pubsub');
const then = require('../../src/utils/then');
const Chai = require('chai');
const expect = Chai.expect;
const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
const errorTypes = require('../../src/errors/error-types');
const PilotModel = require('../../src/models/pilot');
Chai.use(sinonChai);

const STORE_MODIFIED_EVENT = require('../../src/constants/data-service-constants').STORE_MODIFIED_EVENT;

const View = require('../../src/components/common/view');
const EmailVerificationNotice = require('../../src/components/common/notice/email-verification-notice');
const Login = require('../../src/components/public-views/login');


describe('View component.', () => {

  let component;
  let renderedDOMElement;

  const defaults = {
    noticeCloseButtonClass: 'close'
  };

  const mocks = {
    childText: 'test child text',
    childClassName: 'testChild',
    authError: { type: errorTypes.AUTHENTICATION_ERROR },
    notAuthError: { type: 'notAuthError' },
    handleStoreModified: Sinon.spy(),
    handleHideNotice: null
  };


  describe('Defaults testing.', () => {
    before(() => {

      Sinon
        .stub(PilotModel, 'getEmailVerificationNoticeStatus')
        .onFirstCall().returns(false)
        .onSecondCall().returns(true);

      mocks.handleHideNotice = Sinon.stub(PilotModel, 'hideEmailVerificationNotice');

      component = TestUtils.renderIntoDocument(
        <View
          onStoreModified={mocks.handleStoreModified}
          error={mocks.notAuthError}
        >
          {mocks.childText}
        </View>
      );

      renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    after(() => {
      PilotModel.getEmailVerificationNoticeStatus.restore();
      PilotModel.hideEmailVerificationNotice.restore();
    });

    it('sets default state and renders only parsed children', () => {
      const notices = TestUtils.scryRenderedComponentsWithType(component, EmailVerificationNotice);
      const loginForm = TestUtils.scryRenderedComponentsWithType(component, Login);

      expect(component).to.have.deep.property('state.isEmailVerificationNotice', false);
      expect(renderedDOMElement).to.have.property('textContent', mocks.childText);
      expect(notices).to.have.lengthOf(0);
      expect(loginForm).to.have.lengthOf(0);
    });

    it('requests for store data once component was mounted', () => {
      expect(mocks.handleStoreModified).to.have.been.calledOnce;
    });

    it('requests for store data again when store-was-modified event emitted', done => {
      PubSub.emit(STORE_MODIFIED_EVENT);

      then(() => {
        expect(mocks.handleStoreModified).to.have.been.calledTwice;
        // component called PilotModel.getActivationNoticeStatus which returned true on second call
        expect(component).to.have.deep.property('state.isEmailVerificationNotice', true);

        done();
      });
    });

    it('renders email not verified notice with proper props', () => {
      const notice = TestUtils.findRenderedComponentWithType(component, EmailVerificationNotice);

      expect(notice).to.be.ok;
      expect(notice).to.have.deep.property('props.onClose');
    });

    it('close email-not-verified notice when close button clicked', done => {
      const notice = TestUtils.findRenderedComponentWithType(component, EmailVerificationNotice);
      const renderedDOMNotice = ReactDOM.findDOMNode(notice);
      const closeButton = renderedDOMNotice.querySelector(`.${defaults.noticeCloseButtonClass}`);

      Simulate.click(closeButton);

      then(() => {
        expect(component).to.have.deep.property('state.isEmailVerificationNotice', false);
        expect(mocks.handleHideNotice).to.have.been.calledOnce;

        done();
      });
    });
  });


  describe('Authentication error testing', () => {
    before(() => {
      Sinon.stub(PilotModel, 'getEmailVerificationNoticeStatus');

      component = TestUtils.renderIntoDocument(
        <View
          onStoreModified={mocks.handleStoreModified}
          error={mocks.authError}
        >
          <div className={mocks.childClassName}>{mocks.childText}</div>
        </View>
      );

      renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    after(() => {
      PilotModel.getEmailVerificationNoticeStatus.restore();
    });

    it('renders login form instead of parsed children', () => {
      const loginForm = TestUtils.findRenderedComponentWithType(component, Login);
      const parsedChildren = renderedDOMElement.querySelectorAll(`.${mocks.childClassName}`);

      expect(loginForm).to.be.ok;
      expect(parsedChildren).to.have.lengthOf(0);
    });
  });
});
