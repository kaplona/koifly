'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const HomeBlock = require('../../src/components/home-page/home-block');


describe('HomeBlock component', () => {
  let component;
  let renderedDOMElement;

  const mocks = {
    childText: 'test child text'
  };

  before(() => {
    component = TestUtils.renderIntoDocument(
      <HomeBlock>{mocks.childText}</HomeBlock>
    );

    renderedDOMElement = ReactDOM.findDOMNode(component);
  });

  it('renders parsed children', () => {
    expect(renderedDOMElement).to.have.property('textContent', mocks.childText);
  });
});
