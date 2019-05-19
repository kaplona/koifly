'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const ValidationError = require('../../src/components/common/section/validation-error');


describe('ValidationError component', () => {

  let component;
  let renderedDOMElement;

  const mocks = {
    errorMessage: 'test error message'
  };

  before(() => {
    component = TestUtils.renderIntoDocument(
      <ValidationError message={mocks.errorMessage}/>
    );

    renderedDOMElement = ReactDOM.findDOMNode(component);
  });

  it('renders parsed props text', () => {
    expect(renderedDOMElement).to.have.property('textContent', mocks.errorMessage);
  });
});
