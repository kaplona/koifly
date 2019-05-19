'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const InputContainer = require('../../src/components/common/inputs/input-container');


describe('InputContainer component', () => {

  let component;

  const mocks = {
    inputText: 'test input text'
  };

  before(() => {
    component = TestUtils.renderIntoDocument(
      <InputContainer>
        <input value={mocks.inputText}/>
      </InputContainer>
    );
  });

  it('renders parsed children', () => {
    const input = ReactDOM.findDOMNode(component).querySelector('input');

    expect(input).to.have.property('value', mocks.inputText);
  });
});
