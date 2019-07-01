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

const AltitudeInput = require('../../src/components/common/inputs/altitude-input');
const Label = require('../../src/components/common/section/label');
const ValidationError = require('../../src/components/common/section/validation-error');
const Dropdown = require('../../src/components/common/inputs/dropdown');


describe('AltitudeInput component', () => {
  let component;
  let renderedDOMElement;

  const defaults = {
    inputClassName: 'x-number',
    inputPattern: '[0-9]*',
    errorClassName: 'x-error',
    dropdownInputName: 'altitudeUnit'
  };

  const mocks = {
    initialInputValue: 'test input',
    nextInputValue: 'next tst value',
    labelText: 'Test label',
    selectedAltitudeUnit: 'feet',
    nextDropdownValue: 'meters',
    errorMessage: 'test error message',
    inputName: 'testInput',
    handleInputChange: Sinon.spy(),
    handleInputFocus: Sinon.spy(),
    handleInputBlur: Sinon.spy()
  };


  describe('Defaults and behavior testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <AltitudeInput
          inputValue={mocks.initialInputValue}
          labelText={mocks.labelText}
          selectedAltitudeUnit={mocks.selectedAltitudeUnit}
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

    it('renders input with proper value, classes and attributes', () => {
      const inputs = renderedDOMElement.getElementsByTagName('input');

      expect(inputs).to.have.lengthOf(1);
      expect(inputs[0]).to.have.property('value', mocks.initialInputValue);
      expect(inputs[0]).to.have.property('pattern', defaults.inputPattern);

      const className = inputs[0].className;

      expect(className).to.contain(defaults.inputClassName);
      expect(className).to.not.contain(defaults.errorClassName);
    });

    it('renders dropdown with proper props', () => {
      const dropdown = TestUtils.findRenderedComponentWithType(component, Dropdown);

      expect(dropdown).to.have.deep.property('props.selectedValue', mocks.selectedAltitudeUnit);
      expect(dropdown).to.have.deep.property('props.inputName', defaults.dropdownInputName);
      expect(dropdown).to.have.deep.property('props.onChangeFunc', component.handleUserInput);
    });

    it('doesn\'t show error message if wasn\'t provided', () => {
      const errorMessages = TestUtils.scryRenderedComponentsWithType(component, ValidationError);

      expect(errorMessages).to.have.lengthOf(0);
    });

    it('triggers onChange function with proper parameters', () => {
      const input = component.refs[mocks.inputName];
      input.value = mocks.nextInputValue;
      Simulate.change(input);

      expect(mocks.handleInputChange).to.have.been.calledOnce;
      expect(mocks.handleInputChange).to.have.been.calledWith(mocks.inputName, mocks.nextInputValue);

      const dropdown = renderedDOMElement.querySelector('select ');
      dropdown.value = mocks.nextDropdownValue;
      Simulate.change(dropdown);

      expect(mocks.handleInputChange).to.have.been.calledTwice;
      expect(mocks.handleInputChange).to.have.been.calledWith(defaults.dropdownInputName, mocks.nextDropdownValue);
    });

    it('calls onFocus and onBlur functions', () => {
      const input = component.refs[mocks.inputName];
      Simulate.focus(input);
      Simulate.blur(input);

      expect(mocks.handleInputFocus).to.have.been.calledOnce;
      expect(mocks.handleInputBlur).to.have.been.calledOnce;

      const dropdown = renderedDOMElement.querySelector('select ');
      Simulate.focus(dropdown);
      Simulate.blur(dropdown);

      expect(mocks.handleInputFocus).to.have.been.calledTwice;
      expect(mocks.handleInputBlur).to.have.been.calledTwice;
    });
  });


  describe('Error message testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <AltitudeInput
          inputValue={mocks.initialInputValue}
          labelText={mocks.labelText}
          selectedAltitudeUnit={mocks.selectedAltitudeUnit}
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

    it('renders input with error classes if error message presents', () => {
      const inputClassName = renderedDOMElement.querySelector('input').className;

      expect(inputClassName).to.contain(defaults.errorClassName);
    });
  });
});
