/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;
const Chai = require('chai');
const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = Chai.expect;
Chai.use(sinonChai);

const Label = require('../../src/components/common/section/label');
const TextInput = require('../../src/components/common/inputs/text-input');
const ValidationError = require('../../src/components/common/section/validation-error');


describe('TextInput component', () => {
  let component;
  let renderedDOMElement;

  const defaults = {
    textClassName: 'x-text',
    numberClassName: 'x-number',
    errorClassName: 'x-error',
    numberInputPattern: '[0-9]*'
  };

  const mocks = {
    initialInputValue: 'test value',
    nextInputValue: 'next test value',
    labelText: 'Test label',
    errorMessage: 'test error message',
    inputName: 'testInput',
    handleInputChange: Sinon.spy(),
    handleInputFocus: Sinon.spy(),
    handleInputBlur: Sinon.spy()
  };


  describe('Defaults and behavior testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <TextInput
          inputValue={mocks.initialInputValue}
          labelText={mocks.labelText}
          inputName={mocks.inputName}
          onChange={mocks.handleInputChange}
          onFocus={mocks.handleInputFocus}
          onBlur={mocks.handleInputBlur}
        />
      );

      renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders label with proper text', () => {
      const label = TestUtils.findRenderedComponentWithType(component, Label);

      expect(label).to.have.deep.property('props.children', mocks.labelText);
    });

    it('renders input with proper value and classes', () => {
      const inputs = renderedDOMElement.getElementsByTagName('input');

      expect(inputs).to.have.lengthOf(1);
      expect(inputs[0]).to.have.property('value', mocks.initialInputValue);
      expect(inputs[0]).to.not.have.property('pattern', defaults.numberInputPattern);

      const className = inputs[0].className;

      expect(className).to.contain(defaults.textClassName);
      expect(className).to.not.contain(defaults.errorClassName);
    });

    it('doesn\'t show error message if wasn\'t provided', () => {
      const errorMessages = TestUtils.scryRenderedComponentsWithType(component, ValidationError);

      expect(errorMessages).to.have.lengthOf(0);
    });

    it('triggers onChange function with proper parameters when changed', () => {
      const input = component.refs.input;
      input.value = mocks.nextInputValue;
      Simulate.change(input);

      expect(mocks.handleInputChange).to.have.been.calledOnce;
      expect(mocks.handleInputChange).to.have.been.calledWith(mocks.inputName, mocks.nextInputValue);
    });

    it('calls onFocus and onBlur functions', () => {
      const input = component.refs.input;
      Simulate.focus(input);
      Simulate.blur(input);

      expect(mocks.handleInputFocus).to.have.been.calledOnce;
      expect(mocks.handleInputBlur).to.have.been.calledOnce;
    });
  });


  describe('Error message and number input type testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <TextInput
          inputValue={mocks.initialInputValue}
          labelText={mocks.labelText}
          isNumber={true}
          errorMessage={mocks.errorMessage}
          inputName={mocks.inputName}
          onChange={mocks.handleInputChange}
        />
      );

      renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders error message if provided', () => {
      const errorMessage = TestUtils.findRenderedComponentWithType(component, ValidationError);

      expect(errorMessage).to.have.deep.property('props.message', mocks.errorMessage);
    });

    it('renders input with error and number classes', () => {
      const input = renderedDOMElement.querySelector('input');
      const inputClassName = input.className;

      expect(input).to.have.property('pattern', defaults.numberInputPattern);
      expect(inputClassName).to.contain(defaults.numberClassName);
      expect(inputClassName).to.contain(defaults.errorClassName);
    });
  });
});
