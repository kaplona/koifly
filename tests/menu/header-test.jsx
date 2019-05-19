/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;
const Promise = require('es6-promise').Promise;
const PubSub = require('../../src/utils/pubsub');
const then = require('../../src/utils/then');
const Chai = require('chai');
const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = Chai.expect;
const PilotModel = require('../../src/models/pilot');
Chai.use(sinonChai);

const STORE_MODIFIED_EVENT = require('../../src/constants/data-service-constants').STORE_MODIFIED_EVENT;

const Header = require('../../src/components/common/menu/header');


describe('Header component', () => {

  let component;
  let renderedDOMElement;

  const defaults = {
    loginText: 'Log In',
    logoutText: 'Log Out',
    linkClassName: 'logout'
  };

  const mocks = {
    pilotLogout: null // will be used for stub function
  };


  before(() => {
    mocks.pilotLogout = Sinon.stub(PilotModel, 'logout', () => {
      return Promise.reject();
    });

    Sinon
      .stub(PilotModel, 'isLoggedIn')
      .returns(true)
      .onFirstCall().returns(false); // will be called with initial render

    component = TestUtils.renderIntoDocument(
      <Header/>
    );

    renderedDOMElement = ReactDOM.findDOMNode(component);
  });

  after(() => {
    PilotModel.logout.restore();
    PilotModel.isLoggedIn.restore();
  });

  it('renders link with login text', () => {
    const loginLink = renderedDOMElement.querySelector(`.${defaults.linkClassName}`);

    expect(loginLink).to.have.property('textContent', defaults.loginText);
  });

  it('changes state when storeModified event emitted', done => {
    expect(component).to.have.deep.property('state.isLoggedIn', false);

    PubSub.emit(STORE_MODIFIED_EVENT);

    then(() => {
      expect(component).to.have.deep.property('state.isLoggedIn', true);
      done();
    });
  });

  it('renders link with logout text and logout on click', () => {
    const logoutLink = renderedDOMElement.querySelector(`.${defaults.linkClassName}`);

    expect(logoutLink).to.have.property('textContent', defaults.logoutText);

    Simulate.click(logoutLink);

    expect(mocks.pilotLogout).to.be.calledOnce;
  });
});
