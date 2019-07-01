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
const TimeInput = require('../../src/components/common/inputs/time-input');
const ValidationError = require('../../src/components/common/section/validation-error');


describe('TimeInput component', () => {
  let component;
  let renderedDOMElement;

  const defaults = {
    hoursInputName: 'hours',
    minutesInputName: 'minutes',
    inputPattern: '[0-9]*',
    inputClassName: 'x-number',
    errorClassName: 'x-error'
  };

  const mocks = {
    hoursValue: '4',
    minutesValue: '30',
    nextHoursValue: '2',
    nextMinutesValue: '45',
    labelText: 'Test label',
    errorMessage: 'test error message',
    handleInputChange: Sinon.spy(),
    handleInputFocus: Sinon.spy(),
    handleInputBlur: Sinon.spy()
  };


  describe('Defaults and behavior testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <TimeInput
          hours={mocks.hoursValue}
          minutes={mocks.minutesValue}
          labelText={mocks.labelText}
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

    it('renders inputs with proper value, classes and attributes', () => {
      const inputs = renderedDOMElement.getElementsByTagName('input');

      expect(inputs).to.have.lengthOf(2);
      expect(inputs[0]).to.have.property('value', mocks.hoursValue);
      expect(inputs[0]).to.have.property('pattern', defaults.inputPattern);
      expect(inputs[1]).to.have.property('value', mocks.minutesValue);
      expect(inputs[1]).to.have.property('pattern', defaults.inputPattern);

      const hoursClassName = inputs[0].className;
      const minutesClassName = inputs[1].className;

      expect(hoursClassName).to.contain(defaults.inputClassName);
      expect(hoursClassName).to.not.contain(defaults.errorClassName);
      expect(minutesClassName).to.contain(defaults.inputClassName);
      expect(minutesClassName).to.not.contain(defaults.errorClassName);
    });

    it('doesn\'t show error message if wasn\'t provided', () => {
      const errorMessages = TestUtils.scryRenderedComponentsWithType(component, ValidationError);

      expect(errorMessages).to.have.lengthOf(0);
    });

    it('triggers onChange function with proper parameters when changed', () => {
      const hoursInput = component.refs[defaults.hoursInputName];
      hoursInput.value = mocks.nextHoursValue;
      Simulate.change(hoursInput);

      expect(mocks.handleInputChange).to.have.been.calledOnce;
      expect(mocks.handleInputChange).to.have.been.calledWith(defaults.hoursInputName, mocks.nextHoursValue);

      const minutesInput = component.refs[defaults.minutesInputName];
      minutesInput.value = mocks.nextMinutesValue;
      Simulate.change(minutesInput);

      expect(mocks.handleInputChange).to.have.been.calledTwice;
      expect(mocks.handleInputChange).to.have.been.calledWith(defaults.minutesInputName, mocks.nextMinutesValue);
    });

    it('calls onFocus and onBlur functions', () => {
      const hoursInput = component.refs[defaults.hoursInputName];
      Simulate.focus(hoursInput);
      Simulate.blur(hoursInput);

      expect(mocks.handleInputFocus).to.have.been.calledOnce;
      expect(mocks.handleInputBlur).to.have.been.calledOnce;

      const minutesInput = component.refs[defaults.minutesInputName];
      Simulate.focus(minutesInput);
      Simulate.blur(minutesInput);

      expect(mocks.handleInputFocus).to.have.been.calledTwice;
      expect(mocks.handleInputBlur).to.have.been.calledTwice;
    });
  });


  describe('Error message testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <TimeInput
          hours={mocks.hoursValue}
          minutes={mocks.minutesValue}
          labelText={mocks.labelText}
          errorMessage={mocks.errorMessage}
          onChange={mocks.handleInputChange}
        />
      );
    });

    it('renders error when general errorMessage provided', () => {
      const errorMessage = TestUtils.findRenderedComponentWithType(component, ValidationError);
      const highlightedInputs = ReactDOM.findDOMNode(component).querySelectorAll(`input.${defaults.errorClassName}`);

      expect(errorMessage).to.have.deep.property('props.message', mocks.errorMessage);
      expect(highlightedInputs).to.have.lengthOf(2);
    });
  });
});
