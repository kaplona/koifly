'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const CompactContainer = require('../../src/components/common/compact-container');


describe('CompactContainer component', () => {
  let component;
  let renderedDOMElement;

  const mocks = {
    childText: 'test child text'
  };

  before(() => {
    component = TestUtils.renderIntoDocument(
      <CompactContainer>{mocks.childText}</CompactContainer>
    );

    renderedDOMElement = ReactDOM.findDOMNode(component);
  });

  it('renders parsed props text', () => {
    expect(renderedDOMElement).to.have.property('textContent', mocks.childText);
  });
});
