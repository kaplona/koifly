/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;
const Chai = require('chai');
const expect = Chai.expect;
const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
Chai.use(sinonChai);

const AppLink = require('../../src/components/common/app-link');


describe('AppLink component', () => {

  let component;
  let renderedDOMElement;

  const mocks = {
    childText: 'test child type',
    handleClick: Sinon.spy()
  };

  before(() => {
    component = TestUtils.renderIntoDocument(
      <AppLink onClick={mocks.handleClick}>
        {mocks.childText}
      </AppLink>
    );

    renderedDOMElement = ReactDOM.findDOMNode(component);
  });

  it('renders proper text', () => {
    expect(renderedDOMElement).to.have.property('textContent', mocks.childText);
  });

  it('calls parsed function once clicked', () => {
    Simulate.click(renderedDOMElement);

    expect(mocks.handleClick).to.have.been.calledOnce;
  });
});
